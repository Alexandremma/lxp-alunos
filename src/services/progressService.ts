import { supabase } from "@/lib/supabaseClient"
import { resolveExternalDisciplineId, type TrailLesson } from "@/services/trailAdapter"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function resolveCourseDisciplineId(
  trailId: string,
  externalDisciplineId: string,
): Promise<string | null> {
  if (UUID_RE.test(trailId)) return trailId

  const { data, error } = await supabase
    .from("lxp_course_library_links")
    .select("course_discipline_id")
    .eq("library_content_id", externalDisciplineId)
    .order("linked_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data?.course_discipline_id ?? null
}

export type UpsertDisciplineProgressParams = {
  studentProfileId: string
  courseDisciplineId: string
  status: "approved" | "in_progress" | "pending" | "failed"
  grade?: number | null
  xpEarnedDelta?: number
}

export async function upsertDisciplineProgress(params: UpsertDisciplineProgressParams): Promise<void> {
  const now = new Date().toISOString()
  const { error } = await supabase.from("lxp_student_discipline_progress").upsert(
    {
      student_profile_id: params.studentProfileId,
      course_discipline_id: params.courseDisciplineId,
      status: params.status,
      grade: params.grade ?? null,
      ...(params.xpEarnedDelta != null ? { xp_earned: params.xpEarnedDelta } : {}),
      last_updated_at: now,
    },
    { onConflict: "student_profile_id,course_discipline_id" },
  )
  if (error) throw error
}

export type RecordLessonEventParams = {
  studentProfileId: string
  trailId: string
  lessonId: string
  event: "start" | "complete"
  /** Obrigatório quando event === "complete" (para agregar disciplina). */
  totalLessons?: number
  xpEarnedDelta?: number
}

export async function recordLessonEvent(params: RecordLessonEventParams): Promise<void> {
  if (params.event === "complete") {
    const total = params.totalLessons ?? 0
    await recordLessonComplete({
      studentProfileId: params.studentProfileId,
      trailId: params.trailId,
      lessonId: params.lessonId,
      totalLessons: total,
    })
  }
}

export type RecordLessonCompleteParams = {
  studentProfileId: string
  trailId: string
  lessonId: string
  totalLessons: number
}

export async function recordLessonComplete(params: RecordLessonCompleteParams): Promise<void> {
  const externalDisciplineId = await resolveExternalDisciplineId(params.trailId)
  const now = new Date().toISOString()

  const { error: lessonErr } = await supabase.from("lxp_student_lesson_progress").upsert(
    {
      student_profile_id: params.studentProfileId,
      external_discipline_id: externalDisciplineId,
      external_unit_id: params.lessonId,
      status: "completed",
      completed_at: now,
      last_accessed_at: now,
      updated_at: now,
    },
    { onConflict: "student_profile_id,external_discipline_id,external_unit_id" },
  )
  if (lessonErr) throw lessonErr

  const courseDiscId = await resolveCourseDisciplineId(params.trailId, externalDisciplineId)
  if (!courseDiscId) return

  const { count, error: countErr } = await supabase
    .from("lxp_student_lesson_progress")
    .select("*", { count: "exact", head: true })
    .eq("student_profile_id", params.studentProfileId)
    .eq("external_discipline_id", externalDisciplineId)
    .eq("status", "completed")

  if (countErr) throw countErr

  const completedCount = count ?? 0
  const total = params.totalLessons
  const allDone = total > 0 && completedCount >= total
  const status = allDone ? "approved" : "in_progress"

  const { error: discErr } = await supabase.from("lxp_student_discipline_progress").upsert(
    {
      student_profile_id: params.studentProfileId,
      course_discipline_id: courseDiscId,
      status,
      last_updated_at: now,
    },
    { onConflict: "student_profile_id,course_discipline_id" },
  )
  if (discErr) throw discErr
}

export type LessonProgressStatus = "pending" | "in_progress" | "completed"

export async function fetchLessonProgressMap(
  studentProfileId: string,
  externalDisciplineId: string,
): Promise<Record<string, LessonProgressStatus>> {
  const { data, error } = await supabase
    .from("lxp_student_lesson_progress")
    .select("external_unit_id, status")
    .eq("student_profile_id", studentProfileId)
    .eq("external_discipline_id", externalDisciplineId)

  if (error) throw error

  const map: Record<string, LessonProgressStatus> = {}
  for (const row of data ?? []) {
    const unitId = row.external_unit_id as string
    map[unitId] = row.status as LessonProgressStatus
  }
  return map
}

export function mergeTrailLessonsWithProgress(
  lessons: TrailLesson[],
  progressByUnitId: Record<string, LessonProgressStatus>,
): TrailLesson[] {
  let assignedFirstIncomplete = false
  return lessons.map((lesson) => {
    const stored = progressByUnitId[lesson.id]
    if (stored === "completed") {
      return { ...lesson, status: "completed" }
    }
    if (!assignedFirstIncomplete) {
      assignedFirstIncomplete = true
      return { ...lesson, status: "in_progress" }
    }
    return { ...lesson, status: "available" }
  })
}
