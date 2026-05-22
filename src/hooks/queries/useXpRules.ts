import { useQuery } from "@tanstack/react-query";
import { fetchActiveXpRules } from "@/services/gamificationXpRulesService";

export const xpRulesQueryKey = ["gamification", "xp-rules-active"] as const;

export function useXpRules() {
  return useQuery({
    queryKey: xpRulesQueryKey,
    queryFn: fetchActiveXpRules,
    staleTime: 60_000,
  });
}
