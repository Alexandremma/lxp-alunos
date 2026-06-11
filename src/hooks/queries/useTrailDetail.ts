import { useQuery } from "@tanstack/react-query"
import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import {
  getTrailDetail,
  getTrailModules,
  getTrailLessons,
  resolveExternalDisciplineId,
  getDisciplineLessonAccessMode,
  type Trail,
  type TrailLesson,
  type TrailModule,
} from "@/services/trailAdapter"
import { fetchLessonProgressMap, mergeTrailLessonsWithProgress } from "@/services/progressService"
import {
  getDisciplineCompleteXp,
  getLessonCompleteXp,
} from "@/services/gamificationXpRulesService"
import { useXpRules } from "@/hooks/queries/useXpRules"

function applyLessonXpToLessons(
  lessons: TrailLesson[],
  lessonXp: number | undefined,
): TrailLesson[] {
  if (lessonXp === undefined) return lessons
  return lessons.map((l) => ({ ...l, xpReward: lessonXp }))
}

export function useTrailDetail(trailId?: string) {
  const { profile } = useAuth()
  const enabled = Boolean(trailId)
  const xpRulesQ = useXpRules()
  const lessonXp = xpRulesQ.data ? getLessonCompleteXp(xpRulesQ.data) : undefined
  const disciplineCompleteXp = xpRulesQ.data
    ? getDisciplineCompleteXp(xpRulesQ.data)
    : undefined

  const trail = useQuery<Trail | null>({
    queryKey: ["lxp", "trail", "detail", trailId],
    queryFn: () => getTrailDetail(trailId!),
    enabled,
  })

  const modules = useQuery<TrailModule[]>({
    queryKey: ["lxp", "trail", "modules", trailId],
    queryFn: () => getTrailModules(trailId!),
    enabled,
  })

  const lessons = useQuery<TrailLesson[]>({
    queryKey: ["lxp", "trail", "lessons", trailId],
    queryFn: () => getTrailLessons(trailId!),
    enabled,
  })

  const lessonAccessMode = useQuery({
    queryKey: ["lxp", "trail", "lesson-access-mode", trailId],
    queryFn: () => getDisciplineLessonAccessMode(trailId!),
    enabled,
  })

  const progressMap = useQuery({
    queryKey: ["lxp", "trail", "lesson-progress-map", trailId, profile?.id],
    queryFn: async () => {
      const ext = await resolveExternalDisciplineId(trailId!)
      return fetchLessonProgressMap(profile!.id, ext)
    },
    enabled: enabled && Boolean(profile?.id),
  })

  const accessMode = lessonAccessMode.data ?? "free"

  const mergedLessons = React.useMemo(() => {
    const base = applyLessonXpToLessons(lessons.data ?? [], lessonXp)
    const map = progressMap.data
    if (!map) return base
    return applyLessonXpToLessons(
      mergeTrailLessonsWithProgress(base, map, accessMode),
      lessonXp,
    )
  }, [lessons.data, progressMap.data, lessonXp, accessMode])

  const mergedTrail = React.useMemo(() => {
    const t = trail.data
    if (!t) return null
    const completedLessons = mergedLessons.filter((l) => l.status === "completed").length
    const totalLessons = mergedLessons.length > 0 ? mergedLessons.length : t.totalLessons
    return {
      ...t,
      totalLessons,
      completedLessons,
      totalModules: totalLessons,
      xpReward: lessonXp !== undefined ? totalLessons * lessonXp : t.xpReward,
    }
  }, [trail.data, mergedLessons, lessonXp])

  return {
    trail: mergedTrail,
    modules: modules.data ?? [],
    lessons: mergedLessons,
    lessonXp,
    disciplineCompleteXp,
    lessonAccessMode: accessMode,
    isLoading:
      trail.isLoading ||
      modules.isLoading ||
      lessons.isLoading ||
      lessonAccessMode.isLoading ||
      xpRulesQ.isLoading ||
      (Boolean(profile?.id) && progressMap.isLoading),
    error: trail.error || modules.error || lessons.error || progressMap.error,
  }
}
