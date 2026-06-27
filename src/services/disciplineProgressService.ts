import { lessonProgressPercent } from "@/lib/progressPercent"
import { supabase } from "@/lib/supabaseClient"
import {
  getDisciplineLessonAccessMode,
  getTrailLessons,
  resolveExternalDisciplineId,
} from "@/services/trailAdapter"
import {
  fetchLessonProgressMap,
  mergeTrailLessonsWithProgress,
} from "@/services/progressService"

export type DisciplineProgressSnapshot = {
  disciplineId: string
  completedLessons: number
  totalLessons: number
  progressPercent: number
  isComplete: boolean
}

/** @deprecated Use DisciplineProgressSnapshot */
export type DisciplineProgressResult = DisciplineProgressSnapshot

export type DisciplineProgressInput = {
  disciplineId: string
}

/**
 * Lesson-based progress for many disciplines (same source as TrailDetail).
 * Replaces the legacy DB-status heuristic (50% for in_progress).
 */
export async function fetchDisciplineProgressFromDb(
  profileId: string,
  disciplineIds: string[],
): Promise<Map<string, { progressPercent: number; isComplete: boolean }>> {
  const map = new Map<string, { progressPercent: number; isComplete: boolean }>()
  if (disciplineIds.length === 0) return map

  const snapshots = await computeDisciplineProgressBatch(profileId, disciplineIds)
  for (const [disciplineId, snap] of snapshots) {
    map.set(disciplineId, {
      progressPercent: snap.progressPercent,
      isComplete: snap.isComplete,
    })
  }

  return map
}

async function resolveDisciplineLessonProgress(
  profileId: string,
  disciplineId: string,
): Promise<DisciplineProgressSnapshot> {
  const [lessons, externalId, accessMode] = await Promise.all([
    getTrailLessons(disciplineId),
    resolveExternalDisciplineId(disciplineId),
    getDisciplineLessonAccessMode(disciplineId),
  ])
  const progressByUnit = await fetchLessonProgressMap(profileId, externalId)
  const merged = mergeTrailLessonsWithProgress(lessons, progressByUnit, accessMode)

  const totalLessons = merged.length
  const completedLessons = merged.filter((l) => l.status === "completed").length
  const progressPercent = lessonProgressPercent(completedLessons, totalLessons)
  const isComplete = totalLessons > 0 && completedLessons >= totalLessons

  return {
    disciplineId,
    completedLessons,
    totalLessons,
    progressPercent,
    isComplete,
  }
}

/**
 * Progresso real por disciplina (aulas do catálogo matched com progresso no banco).
 * Fonte única para catálogo, overview, Meu Curso e trail detail.
 */
export async function computeDisciplineProgressBatch(
  profileId: string,
  disciplineIds: string[],
): Promise<Map<string, DisciplineProgressSnapshot>> {
  const results = new Map<string, DisciplineProgressSnapshot>()
  if (disciplineIds.length === 0) return results

  const rows = await Promise.all(
    disciplineIds.map((disciplineId) => resolveDisciplineLessonProgress(profileId, disciplineId)),
  )

  for (const row of rows) {
    results.set(row.disciplineId, row)
  }
  return results
}

export async function computeDisciplineProgressPercent(
  profileId: string,
  disciplineId: string,
): Promise<number> {
  const map = await computeDisciplineProgressBatch(profileId, [disciplineId])
  return map.get(disciplineId)?.progressPercent ?? 0
}

export async function getDisciplineProgressSnapshot(
  profileId: string,
  disciplineId: string,
): Promise<DisciplineProgressSnapshot> {
  const map = await computeDisciplineProgressBatch(profileId, [disciplineId])
  return (
    map.get(disciplineId) ?? {
      disciplineId,
      completedLessons: 0,
      totalLessons: 0,
      progressPercent: 0,
      isComplete: false,
    }
  )
}

/**
 * Sincroniza lxp_student_discipline_progress com o progresso real de aulas (catálogo matched).
 */
export async function reconcileDisciplineProgress(
  profileId: string,
  disciplineIds: string[],
): Promise<void> {
  if (disciplineIds.length === 0) return

  const snapshots = await computeDisciplineProgressBatch(profileId, disciplineIds)
  const now = new Date().toISOString()

  await Promise.all(
    [...snapshots.values()].map(async (snap) => {
      const status = snap.isComplete
        ? "approved"
        : snap.completedLessons > 0
          ? "in_progress"
          : "pending"

      const { error } = await supabase.from("lxp_student_discipline_progress").upsert(
        {
          student_profile_id: profileId,
          course_discipline_id: snap.disciplineId,
          status,
          last_updated_at: now,
          completed_at: snap.isComplete ? now : null,
        },
        { onConflict: "student_profile_id,course_discipline_id" },
      )
      if (error) throw error
    }),
  )
}
