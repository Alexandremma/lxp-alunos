import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { xpRulesQueryKey } from "@/hooks/queries/useXpRules";

/**
 * Invalidates XP rules when admin updates lxp_gamification_xp_rules (Supabase Realtime).
 */
export function useXpRulesSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("lxp-gamification-xp-rules")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lxp_gamification_xp_rules",
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: xpRulesQueryKey });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
