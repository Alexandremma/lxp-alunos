import { supabase } from "@/lib/supabaseClient"
import { fetchDisciplineProgressFromDb } from "@/services/disciplineProgressService"
import { getDisciplineCoverPublicUrl } from "@/services/disciplinePresentationService"
import type {
  LibraryItem,
  SearchLibraryResponse,
} from "@/types/library"

export type {
  LibraryContentType,
  LibraryItem,
  SearchLibraryParams,
  SearchLibraryResponse,
} from "@/types/library"

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
 * Lista disciplinas do(s) curso(s) em que o aluno está matriculado e que possuem
 * vínculo em `lxp_course_library_links`.
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
    .select("id, name, code, workload, credits, credits_enabled, professor, course_period_id, status, cover_image_path")
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
      credits:
        (d as { credits_enabled?: boolean }).credits_enabled !== false &&
        d.credits != null &&
        d.credits > 0
          ? d.credits
          : undefined,
      professor: d.professor?.trim() || undefined,
      category: tabCategory,
      courseId: courseId ?? undefined,
      courseName: courseId ? nameByCourse.get(courseId) : undefined,
      enrolled: true,
      progressPercent: progress?.progressPercent ?? 0,
      isComplete: progress?.isComplete ?? false,
      disciplineInactive,
      enrollmentInactive,
      coverImageUrl: getDisciplineCoverPublicUrl(
        (d as { cover_image_path?: string | null }).cover_image_path,
      ),
    })
  }

  items.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
  return { items, total: items.length }
}

