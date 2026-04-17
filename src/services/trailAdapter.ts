import { supabase } from "@/lib/supabaseClient"

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

export async function resolveExternalDisciplineId(trailId: string): Promise<string> {
  if (/^\d+$/.test(trailId)) return trailId

  const { data, error } = await supabase
    .from("lxp_course_library_links")
    .select("library_content_id")
    .eq("course_discipline_id", trailId)
    .eq("library_content_type", "discipline")
    .order("linked_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (data?.library_content_id) return String(data.library_content_id)

  // fallback: em alguns fluxos o route param ja pode ser o proprio content_id externo.
  return trailId
}

/**
 * Quando a API Eadstock não está configurada ou falha, monta estrutura mínima a partir do LXP
 * para a UI não quebrar (aulas demo alinhadas a IDs usados no seed de progresso: u-1, u-2).
 */
async function getDisciplineDetailFallbackFromLxp(trailId: string): Promise<ExternalDisciplineDetail | null> {
  if (!TRAIL_ID_UUID_RE.test(trailId)) return null

  const { data: disc, error } = await supabase
    .from("lxp_course_disciplines")
    .select("id, name, code, workload, professor")
    .eq("id", trailId)
    .maybeSingle()

  if (error) throw error
  if (!disc) return null

  const externalId = await resolveExternalDisciplineId(trailId)
  const title = disc.name?.trim() || disc.code || "Disciplina"
  const unidades: ExternalUnit[] = [
    { id: "u-1", nome: `${title} — Parte 1`, order: 1 },
    { id: "u-2", nome: `${title} — Parte 2`, order: 2 },
  ]

  return {
    id: externalId,
    nome: title,
    ementa: `Disciplina ${disc.code}. Com a biblioteca externa configurada (VITE_EADSTOCK_BASE_URL), as aulas passam a refletir o catálogo real.`,
    carga_horaria: disc.workload ?? 60,
    unidades,
    autores: disc.professor ? [{ nome: disc.professor }] : [],
  }
}

async function getExternalDisciplineDetail(trailId: string): Promise<ExternalDisciplineDetail | null> {
  if (detailCache.has(trailId)) return detailCache.get(trailId) ?? null

  const externalId = await resolveExternalDisciplineId(trailId)
  const baseUrl = normalizeBaseUrl(import.meta.env.VITE_EADSTOCK_BASE_URL)

  if (!baseUrl) {
    const fallback = await getDisciplineDetailFallbackFromLxp(trailId)
    if (fallback) detailCache.set(trailId, fallback)
    return fallback
  }

  const response = await fetch(`${baseUrl}/disciplinas/get/${externalId}`, {
    method: "GET",
    headers: buildHeaders(),
  })

  if (!response.ok) {
    const fallback = await getDisciplineDetailFallbackFromLxp(trailId)
    if (fallback) {
      detailCache.set(trailId, fallback)
      return fallback
    }
    throw new Error(`Falha ao carregar disciplina externa (${response.status}).`)
  }

  const payload = (await response.json()) as ExternalDisciplineDetail
  detailCache.set(trailId, payload)
  return payload
}

export async function getTrailModules(trailId: string): Promise<TrailModule[]> {
  const detail = await getExternalDisciplineDetail(trailId)
  if (!detail) return []

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

  const units = [...(detail.unidades ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return units.map((unit, index) => ({
    id: String(unit.id),
    moduleId: String(unit.id),
    title: unit.nome?.trim() || `Aula ${index + 1}`,
    description: "Conteudo da aula disponibilizado pela biblioteca externa.",
    content: undefined,
    duration: 30,
    type: "reading",
    xpReward: 10,
    status: index === 0 ? "in_progress" : "available",
    ebookPath: unit.url_caderno_digital ?? undefined,
  }))
}

export async function getTrailDetail(trailId: string): Promise<Trail | null> {
  const detail = await getExternalDisciplineDetail(trailId)
  if (!detail) return null

  const units = detail.unidades ?? []
  const totalLessons = units.length
  const estimatedHoursRaw = Number(detail.carga_horaria ?? 0)
  const estimatedHours = Number.isFinite(estimatedHoursRaw) && estimatedHoursRaw > 0
    ? estimatedHoursRaw
    : Math.max(1, Math.ceil(totalLessons / 2))

  const firstAuthor = detail.autores?.[0]?.nome
    ?? units.find((unit) => (unit.autores?.length ?? 0) > 0)?.autores?.[0]?.nome
    ?? "Biblioteca Externa"

  return {
    id: trailId,
    title: detail.nome?.trim() || `Disciplina ${detail.id}`,
    description: detail.ementa ?? "Disciplina vinculada da biblioteca externa.",
    thumbnail: "/placeholder.svg",
    category: "Disciplina",
    instructor: firstAuthor ?? "Biblioteca Externa",
    totalModules: totalLessons,
    totalLessons,
    completedLessons: 0,
    estimatedHours,
    xpReward: totalLessons * 10,
    deadline: undefined,
  }
}

