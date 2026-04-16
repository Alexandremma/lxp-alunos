// Progress persistence skeleton (RLS-safe) - replace with real Supabase writes once mapping is confirmed.
// Intended targets in DB:
// - lxp_student_discipline_progress (discipline-level)
// - [future] lesson-level table if needed, or store in JSONB/aux table

export type UpsertDisciplineProgressParams = {
  studentProfileId: string
  courseDisciplineId: string
  status: "approved" | "in_progress" | "pending" | "failed"
  grade?: number | null
  xpEarnedDelta?: number
}

export async function upsertDisciplineProgress(_params: UpsertDisciplineProgressParams): Promise<void> {
  // TODO: Implement Supabase write with RLS-safe policies and updated_at timestamp
  return
}

export type RecordLessonEventParams = {
  studentProfileId: string
  trailId: string
  lessonId: string
  event: "start" | "complete"
  xpEarnedDelta?: number
}

export async function recordLessonEvent(_params: RecordLessonEventParams): Promise<void> {
  // TODO: Implement lesson-level event persistence and aggregates update
  return
}

