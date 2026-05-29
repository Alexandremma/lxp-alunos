import { supabase } from "@/lib/supabaseClient"
import {
  fetchAliceRentsForDiscipline,
  isAliceConfigured,
  matchAliceRentForLesson,
  type AliceRent,
} from "@/services/aliceService"
import { getDisciplinePresentation } from "@/services/disciplinePresentationService"

export type Trail = {
  id: string
  title: string
  description?: string
  thumbnail?: string
  category?: string
  instructor?: string
  totalModules: number
  totalLessons: number
  completedLessons: number
  estimatedHours: number
  xpReward: number
  deadline?: string
}

export type TrailModule = {
  id: string
  title: string
  description?: string
  order: number
  status: "completed" | "in_progress" | "available" | "locked"
  lessonsCount?: number
}

export type TrailLesson = {
  id: string
  moduleId: string
  title: string
  description?: string
  content?: string
  duration: number
  type?: "video" | "reading" | "quiz" | "project" | "discussion"
  xpReward: number
  status: "completed" | "in_progress" | "available" | "locked"
  ebookPath?: string
  /** Hash ?c= do Alice (GET /api/rents) para launch POST no iframe */
  aliceContentId?: string
}

type ExternalAuthor = { nome?: string | null }

type ExternalUnit = {
  id: number | string
  nome?: string | null
  order?: number | null
  url_caderno_digital?: string | null
  autores?: ExternalAuthor[] | null
}

type ExternalDisciplineDetail = {
  id: number | string
  nome?: string | null
  ementa?: string | null
  carga_horaria?: number | string | null
  unidades?: ExternalUnit[]
  autores?: ExternalAuthor[] | null
}

/** Chave = `trailId` da rota (UUID da disciplina no LXP), para não colidir quando o mesmo ID externo 9001 liga várias disciplinas. */
const detailCache = new Map<string, ExternalDisciplineDetail>()
const aliceRentsCache = new Map<string, AliceRent[]>()

const ALICE_MODULE_ID = "alice-unidades"

const TRAIL_ID_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function normalizeBaseUrl(baseUrl?: string): string {
  if (!baseUrl) return ""
  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) return baseUrl
  return `https://${baseUrl}`
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const apiKey = import.meta.env.VITE_EADSTOCK_API_KEY
  const apiSecret = import.meta.env.VITE_EADSTOCK_API_SECRET
  if (apiKey) headers["X-API-Key"] = apiKey
  // TODO: Validar se X-API-Secret precisa hash SHA256 ou valor bruto.
  if (apiSecret) headers["X-API-Secret"] = apiSecret
  return headers
}

export async function courseDisciplineHasLibraryLink(disciplineId: string): Promise<boolean> {
  if (/^\d+$/.test(disciplineId)) return true
  if (!TRAIL_ID_UUID_RE.test(disciplineId)) return false

  const { data, error } = await supabase
    .from("lxp_course_library_links")
    .select("library_content_id")
    .eq("course_discipline_id", disciplineId)
    .eq("library_content_type", "discipline")
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return Boolean(data?.library_content_id)
}

export async function resolveExternalDisciplineId(trailId: string): Promise<string> {
  if (/^\d+$/.test(trailId)) return trailId

  if (TRAIL_ID_UUID_RE.test(trailId)) {
    const { data, error } = await supabase
      .from("lxp_course_library_links")
      .select("library_content_id")
      .eq("course_discipline_id", trailId)
      .eq("library_content_type", "discipline")
      .order("linked_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    if (!data?.library_content_id) {
      throw new Error("DISCIPLINE_NO_CONTENT_LINK")
    }
    return String(data.library_content_id)
  }

  return trailId
}

/** Metadados LXP sem aulas placeholder — unidades vêm da API externa ou do Alice. */
async function getDisciplineMetadataFromLxp(
  trailId: string,
  externalId: string,
): Promise<ExternalDisciplineDetail | null> {
  if (!TRAIL_ID_UUID_RE.test(trailId)) return null

  const { data: disc, error } = await supabase
    .from("lxp_course_disciplines")
    .select("id, name, code, workload, professor, description, lxp_course_periods(lxp_courses(description))")
    .eq("id", trailId)
    .maybeSingle()

  if (error) throw error
  if (!disc) return null

  const title = disc.name?.trim() || disc.code || "Disciplina"
  const periodRow = disc.lxp_course_periods as
    | { lxp_courses?: { description?: string | null } | null }
    | null
  const courseDescription = periodRow?.lxp_courses?.description?.trim() || undefined
  const disciplineDescription = (disc.description as string | null)?.trim() || undefined

  return {
    id: externalId,
    nome: title,
    ementa: disciplineDescription || courseDescription,
    carga_horaria: disc.workload ?? 60,
    unidades: [],
    autores: disc.professor ? [{ nome: disc.professor }] : [],
  }
}

async function getExternalDisciplineDetail(trailId: string): Promise<ExternalDisciplineDetail | null> {
  if (detailCache.has(trailId)) return detailCache.get(trailId) ?? null

  if (TRAIL_ID_UUID_RE.test(trailId)) {
    const hasLink = await courseDisciplineHasLibraryLink(trailId)
    if (!hasLink) return null
  }

  let externalId: string
  try {
    externalId = await resolveExternalDisciplineId(trailId)
  } catch {
    return null
  }

  const baseUrl = normalizeBaseUrl(import.meta.env.VITE_EADSTOCK_BASE_URL)

  if (!baseUrl) {
    const metadata = await getDisciplineMetadataFromLxp(trailId, externalId)
    if (metadata) detailCache.set(trailId, metadata)
    return metadata
  }

  const response = await fetch(`${baseUrl}/disciplinas/get/${externalId}`, {
    method: "GET",
    headers: buildHeaders(),
  })

  if (!response.ok) {
    const metadata = await getDisciplineMetadataFromLxp(trailId, externalId)
    if (metadata) {
      detailCache.set(trailId, metadata)
      return metadata
    }
    throw new Error(`Falha ao carregar disciplina externa (${response.status}).`)
  }

  const payload = (await response.json()) as ExternalDisciplineDetail
  detailCache.set(trailId, payload)
  return payload
}

async function getAliceRentsForTrail(trailId: string, searchHint?: string): Promise<AliceRent[]> {
  if (!isAliceConfigured()) return []
  if (aliceRentsCache.has(trailId)) return aliceRentsCache.get(trailId) ?? []

  const externalId = await resolveExternalDisciplineId(trailId)
  try {
    const rents = await fetchAliceRentsForDiscipline(externalId, searchHint)
    aliceRentsCache.set(trailId, rents)
    return rents
  } catch (err) {
    console.warn("[trailAdapter] Alice /api/rents:", err)
    aliceRentsCache.set(trailId, [])
    return []
  }
}

function mapAliceRentsToLessons(rents: AliceRent[]): TrailLesson[] {
  return rents.map((rent, index) => ({
    id: rent.contentId,
    moduleId: ALICE_MODULE_ID,
    title: rent.nomeUnidade,
    description: "Conteúdo da aula (Alice / EaDStock).",
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

