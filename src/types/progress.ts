import type { TrailLesson } from "@/types/trail"
import type { LessonAccessMode } from "@/types/discipline"

export type LessonProgressStatus = "pending" | "in_progress" | "completed"

export type UpsertDisciplineProgressParams = {
  studentProfileId: string
  courseDisciplineId: string
  status: "approved" | "in_progress" | "pending" | "failed"
  grade?: number | null
  xpEarnedDelta?: number
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

export type RecordLessonCompleteParams = {
  studentProfileId: string
  trailId: string
  lessonId: string
  totalLessons: number
}

export type MergeTrailLessonsWithProgressParams = {
  lessons: TrailLesson[]
  progressByUnitId: Record<string, LessonProgressStatus>
  accessMode?: LessonAccessMode
}
