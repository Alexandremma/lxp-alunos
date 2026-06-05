import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/consts/queryKeys";
import { AuthContext, type LxpProfile } from "@/hooks/auth-context";
import { shouldRefetchAuthProfile } from "@/hooks/auth-events";
import { supabase } from "@/lib/supabaseClient";
import { recordStudentDailyAccess } from "@/services/studentAccessService";

function trackStudentDailyAccess(profile: LxpProfile | null, invalidateStats?: (id: string) => void) {
  if (!profile || profile.role !== "student") return;
  void recordStudentDailyAccess(profile.id).then(() => invalidateStats?.(profile.id));
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const invalidateGamificationQueries = useCallback((profileId: string) => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats(profileId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.evidences(profileId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.progress.overview(profileId) });
  }, [queryClient]);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<LxpProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setLoading(true);
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const { data, error } = await supabase
          .from("lxp_profiles")
          .select("*")
          .eq("user_id", currentSession.user.id)
          .maybeSingle();

        if (error) {
          console.warn("[use-auth] Erro ao buscar lxp_profiles:", error.message);
        }

        const nextProfile = (data as LxpProfile) ?? null;
        setProfile(nextProfile);
        trackStudentDailyAccess(nextProfile, invalidateGamificationQueries);
      } else {
        setProfile(null);
      }

      setLoading(false);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        setLoading(false);
        queryClient.clear();
        return;
      }

      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED" || !shouldRefetchAuthProfile(event)) {
        return;
      }

      setLoading(true);
      void (async () => {
        try {
          const { data, error } = await supabase
            .from("lxp_profiles")
            .select("*")
            .eq("user_id", nextSession.user.id)
            .maybeSingle();

          if (error) {
            console.warn(
              "[use-auth] Erro ao buscar lxp_profiles (onAuthStateChange):",
              error.message,
            );
          }
          const nextProfile = (data as LxpProfile) ?? null;
          setProfile(nextProfile);
          trackStudentDailyAccess(nextProfile, invalidateGamificationQueries);
        } finally {
          setLoading(false);
        }
      })();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [invalidateGamificationQueries, queryClient]);

  const value = {
    user,
    session,
    profile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
