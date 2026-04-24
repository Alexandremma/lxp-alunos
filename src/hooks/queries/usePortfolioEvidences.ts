import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/consts/queryKeys";
import { getPortfolioEvidences } from "@/services/portfolioService";
import type { LearningEvidence } from "@/types/learningEvidence";

export function usePortfolioEvidences(profileId?: string) {
  return useQuery<LearningEvidence[]>({
    queryKey: profileId
      ? queryKeys.portfolio.evidences(profileId)
      : (["portfolio", "evidences", "__none__"] as const),
    enabled: !!profileId,
    queryFn: () => getPortfolioEvidences(profileId!),
  });
}
