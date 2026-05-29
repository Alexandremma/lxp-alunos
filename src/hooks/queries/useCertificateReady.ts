import { useQuery } from "@tanstack/react-query"
import { isDisciplineCertificateReady } from "@/services/certificateService"

export function useCertificateReady(
  profileId: string | undefined,
  courseDisciplineId: string | undefined,
  completedLessons: number,
  totalLessons: number,
) {
  const enabled = Boolean(profileId && courseDisciplineId)
  return useQuery({
    queryKey: [
      "certificate",
      "ready",
      profileId,
      courseDisciplineId,
      completedLessons,
      totalLessons,
    ] as const,
    enabled,
    queryFn: () =>
      isDisciplineCertificateReady({
        profileId: profileId!,
        courseDisciplineId: courseDisciplineId!,
        completedLessons,
        totalLessons,
      }),
  })
}
