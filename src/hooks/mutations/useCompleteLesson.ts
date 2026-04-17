import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/use-auth"
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
      queryClient.invalidateQueries({ queryKey: ["lxp", "trail", "detail", variables.trailId] })
      queryClient.invalidateQueries({ queryKey: ["lxp", "trail", "modules", variables.trailId] })
      queryClient.invalidateQueries({ queryKey: ["lxp", "trail", "lessons", variables.trailId] })
      queryClient.invalidateQueries({ queryKey: ["lxp", "trail", "lesson-progress-map", variables.trailId] })
    },
  })
}

