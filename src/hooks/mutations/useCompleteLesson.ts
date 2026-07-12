import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/use-auth"
import { queryKeys } from "@/consts/queryKeys"
import { recordLessonComplete } from "@/services/progressService"

export function useCompleteLesson() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { trailId: string; lessonId: string; totalLessons: number }) => {
      if (!profile?.id) throw new Error("Not authenticated")
      await recordLessonComplete({
        studentProfileId: profile.id,
        trailId: params.trailId,
        lessonId: params.lessonId,
        totalLessons: params.totalLessons,
      })
    },
    onSuccess: (_data, variables) => {
      const { trailId } = variables
      queryClient.invalidateQueries({ queryKey: queryKeys.trail.detail(trailId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.trail.modules(trailId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.trail.lessons(trailId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.trail.lessonProgressMap(trailId) })
      if (profile?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats(profile.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.progress.overview(profile.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.myCourse.overviewAll(profile.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.myCourse.summaries(profile.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.evidences(profile.id) })
      }
    },
  })
}

