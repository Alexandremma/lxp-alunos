import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/consts/queryKeys";
import { getDashboardStats, type DashboardStats } from "@/services/dashboardService";

export function useDashboardStats(profileId?: string) {
  return useQuery<DashboardStats>({
    queryKey: profileId
      ? queryKeys.dashboard.stats(profileId)
      : (["dashboard", "stats", "__none__"] as const),
    enabled: !!profileId,
    queryFn: () => getDashboardStats(profileId!),
  });
}
