import { useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/use-auth"
import { enrollStudentByCatalogContent } from "@/services/enrollmentService"
import { queryKeys } from "@/consts/queryKeys"

export function useEnrollInTrail() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()

  const enroll = useCallback(async (contentId: string) => {
    if (!profile?.id) throw new Error("Not authenticated")
    await enrollStudentByCatalogContent({
      studentProfileId: profile.id,
      contentId,
    })
  }, [profile?.id])

  return useMutation({
    mutationFn: (contentId: string) => enroll(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lxp", "catalog"] })
      if (profile?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.activeCourses(profile.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.myCourse.overview(profile.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats(profile.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.progress.overview(profile.id) })
      }
    },
  })
}

