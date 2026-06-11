import { supabase } from "@/lib/supabaseClient"
import { fetchDisciplineProgressFromDb } from "@/services/disciplineProgressService"

export type LibraryContentType = "discipline"

export type LibraryItem = {
  id: string
  name: string
  type: LibraryContentType
  description?: string
  tags?: string[]
  duration?: string
  modulesCount?: number
  lessonsCount?: number
  category?: "course" | "language" | "workshop" | "certification" | "extension"
  progressPercent?: number
  isComplete?: boolean
  enrolled?: boolean
  /** Disciplina inativa no backoffice — exibe "Disciplina inativa" */
  disciplineInactive?: boolean
  /** Matrícula inativa neste curso — bloqueia acesso */
  enrollmentInactive?: boolean
  professor?: string
  workloadHours?: number
  credits?: number
  courseId?: string
  courseName?: string
}

export type SearchLibraryParams = {
  q?: string
  type?: LibraryContentType | "all"
  page?: number
  pageSize?: number
}

export type SearchLibraryResponse = {
  items: LibraryItem[]
  total: number
}

type EadstockDisciplineListItem = {
  id: number | string
  hash?: string | null
  nome?: string | null
  ementa?: string | null
  carga_horaria?: number | string | null
  autores_concat?: string | null
  total_unidades?: number | null
  disciplina_situacao_id?: number | null
  ativo?: number | null
}

type EadstockListResponse = {
  data?: EadstockDisciplineListItem[]
  total?: number
}

function normalizeBaseUrl(baseUrl?: string): string {
  if (!baseUrl) return ""
  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) return baseUrl
  return `https://${baseUrl}`
}

function toDurationLabel(value: EadstockDisciplineListItem["carga_horaria"]): string | undefined {
  if (value == null || value === "") return undefined
  return `${value}h`
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const apiKey = import.meta.env.VITE_EADSTOCK_API_KEY
  const apiSecret = import.meta.env.VITE_EADSTOCK_API_SECRET

  if (apiKey) headers["X-API-Key"] = apiKey
  // TODO: Confirmar formato final de X-API-Secret (sha256 ou valor bruto).
  if (apiSecret) headers["X-API-Secret"] = apiSecret

  return headers
}

function mapCourseCategoryToLibraryTab(
  cat: string | null | undefined,
): NonNullable<LibraryItem["category"]> {
  switch (cat) {
    case "extension":
      return "extension"
    case "postgraduate":
      return "certification"
    default:
      return "course"
  }
}

/**
 * Quando o catálogo Eadstock não está disponível ou vem vazio, lista disciplinas do(s) curso(s)
 * em que o aluno está matriculado e que possuem vínculo em `lxp_course_library_links`.
 * O `id` retornado é o UUID de `lxp_course_disciplines` (use em `/trails/:id`).
 */
export async function getEnrolledLinkedDisciplinesCatalog(
  profileId: string,
  params: { q?: string } = {},
): Promise<SearchLibraryResponse> {
  const q = params.q?.trim().toLowerCase() ?? ""

  const { data: enrollments, error: e1 } = await supabase
    .from("lxp_enrollments")
    .select("course_id,status")
    .eq("student_profile_id", profileId)
    .eq("status", "active")
  if (e1) throw e1

  const enrollmentByCourse = new Map(
    (enrollments ?? []).map((r) => [r.course_id as string, r.status as string]),
  )
  const courseIds = [...new Set((enrollments ?? []).map((r) => r.course_id as string))]
  if (courseIds.length === 0) return { items: [], total: 0 }

  const { data: courses, error: e2 } = await supabase
    .from("lxp_courses")
    .select("id, name, category")
    .in("id", courseIds)
  if (e2) throw e2
  const catByCourse = new Map((courses ?? []).map((c) => [c.id, c.category as string]))
  const nameByCourse = new Map((courses ?? []).map((c) => [c.id, (c.name as string)?.trim() || "Curso"]))

  const { data: periods, error: e3 } = await supabase
    .from("lxp_course_periods")
    .select("id, course_id")
    .in("course_id", courseIds)
  if (e3) throw e3

  const periodIds = (periods ?? []).map((p) => p.id)
  const courseByPeriod = new Map((periods ?? []).map((p) => [p.id, p.course_id]))
  if (periodIds.length === 0) return { items: [], total: 0 }

  const { data: disciplines, error: e4 } = await supabase
    .from("lxp_course_disciplines")
    .select("id, name, code, workload, credits, professor, course_period_id, status")
    .in("course_period_id", periodIds)
  if (e4) throw e4

  const discIds = (disciplines ?? []).map((d) => d.id)
  if (discIds.length === 0) return { items: [], total: 0 }

  const { data: links, error: e5 } = await supabase
    .from("lxp_course_library_links")
    .select("course_discipline_id, library_content_id, library_content_name")
    .eq("library_content_type", "discipline")
    .in("course_discipline_id", discIds)
  if (e5) throw e5

  const linkByDisc = new Map((links ?? []).map((l) => [l.course_discipline_id, l]))

  const linkedDiscIds = (disciplines ?? []).filter((d) => linkByDisc.has(d.id)).map((d) => d.id)
  const progressByDisc = await fetchDisciplineProgressFromDb(profileId, linkedDiscIds)

  const items: LibraryItem[] = []
  for (const d of disciplines ?? []) {
    if (!linkByDisc.has(d.id)) continue
    const courseId = courseByPeriod.get(d.course_period_id)
    const enrollmentStatus = courseId ? enrollmentByCourse.get(courseId) : undefined
    const tabCategory = mapCourseCategoryToLibraryTab(courseId ? catByCourse.get(courseId) : undefined)
    const name = d.name?.trim() ?? d.code ?? "Disciplina"
    const code = (d.code ?? "").toLowerCase()
    if (q && !name.toLowerCase().includes(q) && !code.includes(q)) continue

    const disciplineInactive = (d.status as string) === "inactive"
    const enrollmentInactive = enrollmentStatus === "inactive"
    const progress = progressByDisc.get(d.id)
    items.push({
      id: d.id,
      name,
      type: "discipline",
      duration: d.workload != null && d.workload > 0 ? `${d.workload}h` : undefined,
      workloadHours: d.workload != null && d.workload > 0 ? d.workload : undefined,
      credits: d.credits != null && d.credits > 0 ? d.credits : undefined,
      professor: d.professor?.trim() || undefined,
      category: tabCategory,
      courseId: courseId ?? undefined,
      courseName: courseId ? nameByCourse.get(courseId) : undefined,
      enrolled: true,
      progressPercent: progress?.progressPercent ?? 0,
      isComplete: progress?.isComplete ?? false,
      disciplineInactive,
      enrollmentInactive,
    })
  }

  items.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
  return { items, total: items.length }
}

export async function getLibraryCatalog(params: SearchLibraryParams): Promise<SearchLibraryResponse> {
  const baseUrl = normalizeBaseUrl(import.meta.env.VITE_EADSTOCK_BASE_URL)
  if (!baseUrl) {
    // TODO: Definir VITE_EADSTOCK_BASE_URL por ambiente para habilitar listagem real no LXP.
    return { items: [], total: 0 }
  }

  const query = new URLSearchParams()
  query.set("page", String(params.page ?? 1))
  query.set("pageSize", String(params.pageSize ?? 24))
  if (params.q?.trim()) query.set("disciplina", params.q.trim())

  const response = await fetch(`${baseUrl}/scout/disciplinas/list?${query.toString()}`, {
    method: "GET",
    headers: buildHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Falha ao carregar catalogo da biblioteca (${response.status}).`)
  }

  const payload = (await response.json()) as EadstockListResponse
  const rows = payload.data ?? []

  const filtered = rows.filter((row) => {
    // TODO: Confirmar regra final de publicacao por disciplina_situacao_id para o aluno.
    const hasAllowedStatus = row.disciplina_situacao_id == null || row.disciplina_situacao_id === 3
    const isActive = row.ativo == null || row.ativo === 1
    return hasAllowedStatus && isActive
  })

  return {
    items: filtered.map((row) => ({
      id: String(row.id),
      name: row.nome?.trim() || row.hash?.trim() || `Disciplina ${row.id}`,
      type: "discipline",
      description: row.ementa ?? undefined,
      tags: row.autores_concat ? row.autores_concat.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      duration: toDurationLabel(row.carga_horaria),
      lessonsCount: row.total_unidades ?? undefined,
      category: "extension",
      enrolled: false,
      progressPercent: 0,
    })),
    total: payload.total ?? filtered.length,
  }
}

