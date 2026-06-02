import { supabase } from "@/lib/supabaseClient"
import { getTrailLessons, resolveExternalDisciplineId } from "@/services/trailAdapter"
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

async function resolveDisciplineLessonProgress(
  profileId: string,
  disciplineId: string,
): Promise<DisciplineProgressSnapshot> {
  const lessons = await getTrailLessons(disciplineId)
  const externalId = await resolveExternalDisciplineId(disciplineId)
  const progressByUnit = await fetchLessonProgressMap(profileId, externalId)
  const merged = mergeTrailLessonsWithProgress(lessons, progressByUnit)

  const totalLessons = merged.length
  const completedLessons = merged.filter((l) => l.status === "completed").length
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
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
