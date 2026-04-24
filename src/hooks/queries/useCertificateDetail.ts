import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/consts/queryKeys";
import { getCertificateDetail, type CertificateDetail } from "@/services/certificateService";

export function useCertificateDetail(profileId?: string, courseDisciplineId?: string) {
  const enabled = Boolean(profileId && courseDisciplineId);
  return useQuery<CertificateDetail | null>({
    queryKey:
      enabled && profileId && courseDisciplineId
        ? queryKeys.certificate.detail(profileId, courseDisciplineId)
        : (["certificate", "detail", "__none__", "__none__"] as const),
    enabled,
    queryFn: () =>
      getCertificateDetail({
        profileId: profileId!,
        courseDisciplineId: courseDisciplineId!,
      }),
  });
}
