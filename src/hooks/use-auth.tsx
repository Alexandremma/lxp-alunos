import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

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

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);
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

        setProfile((data as LxpProfile) ?? null);
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
          setProfile((data as LxpProfile) ?? null);
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

