import { useQuery } from "@tanstack/react-query"
import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import {
  getTrailDetail,
  getTrailModules,
  getTrailLessons,
  resolveExternalDisciplineId,
  type Trail,
  type TrailModule,
} from "@/services/trailAdapter"
import { fetchLessonProgressMap, mergeTrailLessonsWithProgress } from "@/services/progressService"

export function useTrailDetail(trailId?: string) {
  const { profile } = useAuth()
  const enabled = Boolean(trailId)

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

  const progressMap = useQuery({
    queryKey: ["lxp", "trail", "lesson-progress-map", trailId, profile?.id],
    queryFn: async () => {
      const ext = await resolveExternalDisciplineId(trailId!)
      return fetchLessonProgressMap(profile!.id, ext)
    },
    enabled: enabled && Boolean(profile?.id),
  })

  const mergedLessons = React.useMemo(() => {
    const base = lessons.data ?? []
    const map = progressMap.data
    if (!map) return base
    return mergeTrailLessonsWithProgress(base, map)
  }, [lessons.data, progressMap.data])

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
    }
  }, [trail.data, mergedLessons])

  return {
    trail: mergedTrail,
    modules: modules.data ?? [],
    lessons: mergedLessons,
    isLoading:
      trail.isLoading ||
      modules.isLoading ||
      lessons.isLoading ||
      (Boolean(profile?.id) && progressMap.isLoading),
    error: trail.error || modules.error || lessons.error || progressMap.error,
  }
}

