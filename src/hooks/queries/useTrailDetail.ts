import { useQuery } from "@tanstack/react-query"
import { getTrailDetail, getTrailModules, getTrailLessons, type Trail, type TrailModule, type TrailLesson } from "@/services/trailAdapter"

export function useTrailDetail(trailId?: string) {
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

  return {
    trail: trail.data ?? null,
    modules: modules.data ?? [],
    lessons: lessons.data ?? [],
    isLoading: trail.isLoading || modules.isLoading || lessons.isLoading,
    error: trail.error || modules.error || lessons.error,
  }
}

