import { supabase } from "@/lib/supabaseClient"
import {
  fetchAliceRentsForDiscipline,
  isAliceConfigured,
  type AliceRent,
} from "@/services/aliceService"
import type { LessonAccessMode } from "@/types/discipline"
import {
  aliceRentsCache,
  detailCache,
  type ExternalDisciplineDetail,
  TRAIL_ID_UUID_RE,
} from "@/services/trail/trailCache"

export function normalizeBaseUrl(baseUrl?: string): string {
  if (!baseUrl) return ""
  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) return baseUrl
  return `https://${baseUrl}`
}

export function isEadstockConfigured(): boolean {
  return Boolean(normalizeBaseUrl(import.meta.env.VITE_EADSTOCK_BASE_URL))
}

export function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const apiKey = import.meta.env.VITE_EADSTOCK_API_KEY
  const apiSecret = import.meta.env.VITE_EADSTOCK_API_SECRET
  if (apiKey) headers["X-API-Key"] = apiKey
  // TODO: Validar se X-API-Secret precisa hash SHA256 ou valor bruto.
  if (apiSecret) headers["X-API-Secret"] = apiSecret
  return headers
}

export async function getDisciplineLessonAccessMode(
  disciplineId: string,
): Promise<LessonAccessMode> {
  if (!TRAIL_ID_UUID_RE.test(disciplineId)) return "free"

  const { data, error } = await supabase
    .from("lxp_course_disciplines")
    .select("lesson_access_mode")
    .eq("id", disciplineId)
    .maybeSingle()

  if (error) throw error
  const mode = (data as { lesson_access_mode?: string } | null)?.lesson_access_mode
  return mode === "sequential" ? "sequential" : "free"
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
export async function getDisciplineMetadataFromLxp(
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

export async function getExternalDisciplineDetail(trailId: string): Promise<ExternalDisciplineDetail | null> {
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

export async function getAliceRentsForTrail(trailId: string, searchHint?: string): Promise<AliceRent[]> {
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
