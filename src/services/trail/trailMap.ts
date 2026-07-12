import type { AliceRent } from "@/types/alice"
import {
  fetchAliceRentsForDiscipline,
  isAliceConfigured,
  matchAliceRentForLesson,
} from "@/services/aliceService"
import { getDisciplinePresentation } from "@/services/disciplinePresentationService"
import type { TrailContentStatus } from "@/types/trail"
import type { Trail, TrailLesson, TrailModule } from "@/types/trail"
import { ALICE_MODULE_ID, type ExternalDisciplineDetail, TRAIL_ID_UUID_RE } from "@/services/trail/trailCache"
import {
  buildHeaders,
  courseDisciplineHasLibraryLink,
  getAliceRentsForTrail,
  getExternalDisciplineDetail,
  isEadstockConfigured,
  normalizeBaseUrl,
  resolveExternalDisciplineId,
} from "@/services/trail/trailFetch"

export function mapAliceRentsToLessons(rents: AliceRent[]): TrailLesson[] {
  return rents.map((rent, index) => ({
    id: rent.contentId,
    moduleId: ALICE_MODULE_ID,
    title: rent.nomeUnidade,
    description: "",
    content: undefined,
    duration: 30,
    type: "reading" as const,
    /** Substituído em useTrailDetail por lxp_gamification_xp_rules.lesson_complete */
    xpReward: 10,
    status: index === 0 ? "in_progress" : "available",
    aliceContentId: rent.contentId,
  }))
}

export async function getTrailModules(trailId: string): Promise<TrailModule[]> {
  const detail = await getExternalDisciplineDetail(trailId)
  if (!detail) return []

  const aliceRents = await getAliceRentsForTrail(trailId, detail.nome?.trim() ?? undefined)
  if (aliceRents.length > 0) {
    return [
      {
        id: ALICE_MODULE_ID,
        title: "Aulas",
        description: undefined,
        order: 1,
        status: "in_progress",
        lessonsCount: aliceRents.length,
      },
    ]
  }

  const units = [...(detail.unidades ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return units.map((unit, index) => ({
    id: String(unit.id),
    title: unit.nome?.trim() || `Unidade ${index + 1}`,
    description: undefined,
    order: unit.order ?? index + 1,
    status: index === 0 ? "in_progress" : "available",
    lessonsCount: 1,
  }))
}

export async function getTrailLessons(trailId: string): Promise<TrailLesson[]> {
  const detail = await getExternalDisciplineDetail(trailId)
  if (!detail) return []

  const aliceRents = await getAliceRentsForTrail(trailId, detail.nome?.trim() ?? undefined)
  if (aliceRents.length > 0) {
    return mapAliceRentsToLessons(aliceRents)
  }

  const units = [...(detail.unidades ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const aliceRentsForMatch = isAliceConfigured()
    ? await getAliceRentsForTrail(trailId, detail.nome?.trim() ?? undefined)
    : []

  return units.map((unit, index) => {
    const unitTitle = unit.nome?.trim() || `Aula ${index + 1}`
    const rent = matchAliceRentForLesson(aliceRentsForMatch, unitTitle, index)
    return {
      id: String(unit.id),
      moduleId: String(unit.id),
      title: unitTitle,
      description: "Conteudo da aula disponibilizado pela biblioteca externa.",
      content: undefined,
      duration: 30,
      type: "reading" as const,
      xpReward: 10,
      status: index === 0 ? "in_progress" : "available",
      ebookPath: unit.url_caderno_digital ?? undefined,
      aliceContentId: rent?.contentId,
    }
  })
}

/**
 * Diagnóstico quando a disciplina carrega metadados mas a lista de aulas vem vazia.
 * Diferencia integração ausente, falha na API externa e catálogo vazio/desalinhado.
 */
export async function resolveTrailContentStatus(trailId: string): Promise<TrailContentStatus> {
  const lessons = await getTrailLessons(trailId)
  if (lessons.length > 0) return { state: "ready" }

  const hasLink = TRAIL_ID_UUID_RE.test(trailId)
    ? await courseDisciplineHasLibraryLink(trailId)
    : true

  if (!hasLink) {
    return {
      state: "unavailable",
      reason: "empty_catalog",
      title: "Conteúdo em preparação",
      description:
        "Esta disciplina ainda está em preparação. Quando as aulas estiverem disponíveis, elas aparecerão aqui.",
    }
  }

  const aliceConfigured = isAliceConfigured()
  const eadstockConfigured = isEadstockConfigured()

  if (!aliceConfigured && !eadstockConfigured) {
    return {
      state: "unavailable",
      reason: "no_integration",
      title: "Aulas indisponíveis no momento",
      description:
        "Não foi possível carregar as aulas desta disciplina agora. Tente novamente mais tarde ou entre em contato com a instituição.",
    }
  }

  let externalError = false
  let foundLessons = false

  let externalId: string
  try {
    externalId = await resolveExternalDisciplineId(trailId)
  } catch {
    return {
      state: "unavailable",
      reason: "empty_catalog",
      title: "Aulas indisponíveis no momento",
      description:
        "Não foi possível carregar as aulas desta disciplina agora. Tente novamente mais tarde ou entre em contato com a instituição.",
    }
  }

  if (eadstockConfigured) {
    const baseUrl = normalizeBaseUrl(import.meta.env.VITE_EADSTOCK_BASE_URL)
    try {
      const response = await fetch(`${baseUrl}/disciplinas/get/${externalId}`, {
        method: "GET",
        headers: buildHeaders(),
      })
      if (!response.ok) {
        externalError = true
      } else {
        const payload = (await response.json()) as ExternalDisciplineDetail
        if ((payload.unidades ?? []).length > 0) foundLessons = true
      }
    } catch {
      externalError = true
    }
  }

  if (aliceConfigured) {
    try {
      const rents = await fetchAliceRentsForDiscipline(externalId)
      if (rents.length > 0) foundLessons = true
    } catch {
      externalError = true
    }
  }

  if (foundLessons) {
    return { state: "ready" }
  }

  if (externalError) {
    return {
      state: "unavailable",
      reason: "external_error",
      title: "Não foi possível carregar as aulas",
      description:
        "Verifique sua conexão com a internet e tente novamente em instantes.",
    }
  }

  return {
    state: "unavailable",
    reason: "empty_catalog",
    title: "Nenhuma aula disponível",
    description:
      "Ainda não há aulas publicadas para esta disciplina. A instituição pode estar atualizando o conteúdo.",
  }
}

export async function getTrailDetail(trailId: string): Promise<Trail | null> {
  const detail = await getExternalDisciplineDetail(trailId)
  if (!detail) return null

  const presentation = TRAIL_ID_UUID_RE.test(trailId)
    ? await getDisciplinePresentation(trailId).catch(() => null)
    : null

  const aliceRents = await getAliceRentsForTrail(trailId, detail.nome?.trim() ?? undefined)
  const units = detail.unidades ?? []
  const totalLessons = aliceRents.length > 0 ? aliceRents.length : units.length
  const totalModules = aliceRents.length > 0 ? 1 : units.length
  const estimatedHoursRaw = Number(detail.carga_horaria ?? 0)
  const estimatedHours = Number.isFinite(estimatedHoursRaw) && estimatedHoursRaw > 0
    ? estimatedHoursRaw
    : Math.max(1, Math.ceil(totalLessons / 2))

  const firstAuthor = detail.autores?.[0]?.nome
    ?? units.find((unit) => (unit.autores?.length ?? 0) > 0)?.autores?.[0]?.nome
    ?? "Equipe Acadêmica"

  const subtitle = TRAIL_ID_UUID_RE.test(trailId)
    ? presentation?.subtitle?.trim() || undefined
    : detail.ementa?.trim() || undefined

  return {
    id: trailId,
    title: detail.nome?.trim() || `Disciplina ${detail.id}`,
    description: subtitle,
    thumbnail: presentation?.coverImageUrl ?? "/placeholder.svg",
    category: "Disciplina",
    instructor: firstAuthor ?? "Equipe Acadêmica",
    totalModules,
    totalLessons,
    completedLessons: 0,
    estimatedHours,
    xpReward: totalLessons * 10,
    deadline: undefined,
  }
}
