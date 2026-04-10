import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/use-auth"

// Stub: replace with real persistence in Supabase once lesson-level progress is available.
export function useCompleteLesson() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { trailId: string; lessonId: string }) => {
      if (!profile?.id) throw new Error("Not authenticated")
      // TODO: Persist lesson completion and update discipline/course aggregates.
      return
    },
    onSuccess: (_data, variables) => {
      // Invalidate trail detail caches to refresh progress UI when implemented
      queryClient.invalidateQueries({ queryKey: ["lxp", "trail", "detail", variables.trailId] })
      queryClient.invalidateQueries({ queryKey: ["lxp", "trail", "modules", variables.trailId] })
      queryClient.invalidateQueries({ queryKey: ["lxp", "trail", "lessons", variables.trailId] })
    },
  })
}

