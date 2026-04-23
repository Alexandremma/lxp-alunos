import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/consts/queryKeys";
import { getProgressOverview, type ProgressOverview } from "@/services/progressOverviewService";

export function useProgressOverview(profileId?: string) {
  return useQuery<ProgressOverview>({
    queryKey: profileId
      ? queryKeys.progress.overview(profileId)
      : (["progress", "overview", "__none__"] as const),
    enabled: !!profileId,
    queryFn: () => getProgressOverview(profileId!),
  });
}
