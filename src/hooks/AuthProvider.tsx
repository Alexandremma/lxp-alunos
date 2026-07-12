import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/consts/queryKeys";
import { AuthContext } from "@/hooks/auth-context";
import type { LxpProfile } from "@/types/auth";
import { shouldBlockUiForAuthProfileFetch, shouldRefetchAuthProfile } from "@/hooks/auth-events";
import { supabase } from "@/lib/supabaseClient";
import { recordStudentDailyAccess } from "@/services/studentAccessService";
import { resetStudentAccessGateCache } from "@/hooks/useStudentAccessGate";

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
  const profileRef = useRef<LxpProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isResolvingProfile, setIsResolvingProfile] = useState(false);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const loadProfileForUser = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("lxp_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.warn("[use-auth] Erro ao buscar lxp_profiles:", error.message);
    }

    return (data as LxpProfile) ?? null;
  }, []);

  const applyProfile = useCallback(
    (nextProfile: LxpProfile | null) => {
      setProfile(nextProfile);
      trackStudentDailyAccess(nextProfile, invalidateGamificationQueries);
    },
    [invalidateGamificationQueries],
  );

  const refetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const nextProfile = await loadProfileForUser(user.id);
    applyProfile(nextProfile);
  }, [user, loadProfileForUser, applyProfile]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setIsInitializing(true);
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const nextProfile = await loadProfileForUser(currentSession.user.id);
        applyProfile(nextProfile);
      } else {
        setProfile(null);
      }

      setIsInitializing(false);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        setIsResolvingProfile(false);
        resetStudentAccessGateCache();
        queryClient.clear();
        return;
      }

      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED" || !shouldRefetchAuthProfile(event)) {
        return;
      }

      const userId = nextSession.user.id;
      const hasProfileForCurrentUser = profileRef.current?.user_id === userId;
      const blockUi = shouldBlockUiForAuthProfileFetch(event, hasProfileForCurrentUser);

      if (blockUi) {
        setIsResolvingProfile(true);
      }

      void (async () => {
        try {
          const nextProfile = await loadProfileForUser(userId);
          applyProfile(nextProfile);
        } finally {
          if (blockUi) {
            setIsResolvingProfile(false);
          }
        }
      })();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [applyProfile, invalidateGamificationQueries, loadProfileForUser, queryClient]);

  const loading = isInitializing || isResolvingProfile;

  const value = {
    user,
    session,
    profile,
    loading,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
