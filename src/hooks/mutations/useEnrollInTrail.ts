import { useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/use-auth"

// Stub: Replace with real enrollment persistence (Supabase) once the contract is defined.
export function useEnrollInTrail() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()

  const enroll = useCallback(async (contentId: string) => {
    if (!profile?.id) throw new Error("Not authenticated")
    // TODO: Implement enrollment persistence linking contentId to the student (and/or discipline/course)
    // No-op for now.
    return
  }, [profile?.id])

  return useMutation({
    mutationFn: (contentId: string) => enroll(contentId),
    onSuccess: () => {
      // Invalidate catalog so enrolled/progress flags can refresh when implemented
      queryClient.invalidateQueries({ queryKey: ["lxp", "catalog"] })
    },
  })
}

