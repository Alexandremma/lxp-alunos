import { supabase } from "@/lib/supabaseClient"
import { ensureCertificateIssue } from "@/services/certificateIssueService"
import {
  getDisciplineLessonAccessMode,
  getTrailLessons,
  resolveExternalDisciplineId,
  type TrailLesson,
} from "@/services/trailAdapter"
import type { LessonAccessMode } from "@/types/discipline"
import type {
  LessonProgressStatus,
  RecordLessonCompleteParams,
  RecordLessonEventParams,
  UpsertDisciplineProgressParams,
} from "@/types/progress"

export type {
  LessonProgressStatus,
  RecordLessonCompleteParams,
  RecordLessonEventParams,
  UpsertDisciplineProgressParams,
} from "@/types/progress"
export type { LessonAccessMode } from "@/types/discipline"

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

  const [lessons, accessMode] = await Promise.all([
    getTrailLessons(params.trailId),
    getDisciplineLessonAccessMode(params.trailId),
  ])
  const progressByUnit = await fetchLessonProgressMap(params.studentProfileId, externalDisciplineId)
  const merged = mergeTrailLessonsWithProgress(lessons, progressByUnit, accessMode)
  const completedCount = merged.filter((l) => l.status === "completed").length
  const total = merged.length
  const allDone = total > 0 && completedCount >= total
  const status =
    completedCount === 0 ? "pending" : allDone ? "approved" : "in_progress"

  const { error: discErr } = await supabase.from("lxp_student_discipline_progress").upsert(
    {
      student_profile_id: params.studentProfileId,
      course_discipline_id: courseDiscId,
      status,
      last_updated_at: now,
      completed_at: allDone ? now : null,
    },
    { onConflict: "student_profile_id,course_discipline_id" },
  )
  if (discErr) throw discErr

  if (allDone) {
    await ensureCertificateIssue({
      studentProfileId: params.studentProfileId,
      courseDisciplineId: courseDiscId,
    })
  }
}

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
  accessMode: LessonAccessMode = "free",
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
    if (accessMode === "sequential") {
      return { ...lesson, status: "locked" }
    }
    return { ...lesson, status: "available" }
  })
}
