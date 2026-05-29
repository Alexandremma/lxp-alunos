import { supabase } from "@/lib/supabaseClient"
import { getTrailLessons, resolveExternalDisciplineId } from "@/services/trailAdapter"

export type DisciplineProgressInput = {
  disciplineId: string
}

export type DisciplineProgressResult = {
  disciplineId: string
  completedLessons: number
  totalLessons: number
  progressPercent: number
}

/**
 * Contagem de aulas concluídas por external_discipline_id para um aluno.
 */
export async function fetchCompletedLessonsByExternalId(
  profileId: string,
): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from("lxp_student_lesson_progress")
    .select("external_discipline_id,status")
    .eq("student_profile_id", profileId)

  if (error) throw error

  const map = new Map<string, number>()
  for (const row of data ?? []) {
    if (row.status !== "completed") continue
    const key = row.external_discipline_id as string
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return map
}

/**
 * Progresso real por disciplina (aulas concluídas / total de aulas).
 * Fonte única para catálogo, overview e cards.
 */
export async function computeDisciplineProgressBatch(
  profileId: string,
  disciplineIds: string[],
): Promise<Map<string, DisciplineProgressResult>> {
  const results = new Map<string, DisciplineProgressResult>()
  if (disciplineIds.length === 0) return results

  const completedByExternal = await fetchCompletedLessonsByExternalId(profileId)

  const rows = await Promise.all(
    disciplineIds.map(async (disciplineId) => {
      const lessons = await getTrailLessons(disciplineId)
      const externalId = await resolveExternalDisciplineId(disciplineId)
      const completedLessons = completedByExternal.get(externalId) ?? 0
      const totalLessons = Math.max(lessons.length, completedLessons, 1)
      const progressPercent = Math.round((completedLessons / totalLessons) * 100)

      return {
        disciplineId,
        completedLessons,
        totalLessons,
        progressPercent,
      } satisfies DisciplineProgressResult
    }),
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
