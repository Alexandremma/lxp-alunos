import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/consts/queryKeys"
import { isDisciplineCertificateReady } from "@/services/certificateService"

export function useCertificateReady(
  profileId: string | undefined,
  courseDisciplineId: string | undefined,
  completedLessons: number,
  totalLessons: number,
  options?: { enabled?: boolean },
) {
  const enabled =
    (options?.enabled ?? true) && Boolean(profileId && courseDisciplineId);
  return useQuery({
    queryKey: queryKeys.certificate.ready(
      profileId!,
      courseDisciplineId!,
      completedLessons,
      totalLessons,
    ),
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
