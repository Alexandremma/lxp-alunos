import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/consts/queryKeys";
import { getDashboardStats } from "@/services/dashboardService";
import type { DashboardStats } from "@/types/dashboard";

export function useDashboardStats(profileId?: string) {
  return useQuery<DashboardStats>({
    queryKey: profileId
      ? queryKeys.dashboard.stats(profileId)
      : (["dashboard", "stats", "__none__"] as const),
    enabled: !!profileId,
    queryFn: () => getDashboardStats(profileId!),
  });
}
