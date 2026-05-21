import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/consts/queryKeys";
import { recordStudentDailyAccess } from "@/services/studentAccessService";

type ProfileRole = "student" | "admin" | "staff" | string;

export type LxpProfile = {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  role: ProfileRole;
  created_at: string;
  updated_at: string;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: LxpProfile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function trackStudentDailyAccess(profile: LxpProfile | null, invalidateStats?: (id: string) => void) {
  if (!profile || profile.role !== "student") return;
  void recordStudentDailyAccess(profile.id).then(() => invalidateStats?.(profile.id));
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const invalidateGamificationQueries = (profileId: string) => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats(profileId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.evidences(profileId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.progress.overview(profileId) });
  };
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
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      supabase
        .from("lxp_profiles")
        .select("*")
        .eq("user_id", nextSession.user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) {
            console.warn(
              "[use-auth] Erro ao buscar lxp_profiles (onAuthStateChange):",
              error.message,
            );
          }
          const nextProfile = (data as LxpProfile) ?? null;
          setProfile(nextProfile);
          trackStudentDailyAccess(nextProfile, invalidateGamificationQueries);
        })
        .finally(() => setLoading(false));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextValue = {
    user,
    session,
    profile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}

