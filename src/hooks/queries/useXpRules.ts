import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/consts/queryKeys";
import { fetchActiveXpRules } from "@/services/gamificationXpRulesService";

export function useXpRules() {
  return useQuery({
    queryKey: queryKeys.gamification.xpRules,
    queryFn: fetchActiveXpRules,
    staleTime: 60_000,
  });
}
