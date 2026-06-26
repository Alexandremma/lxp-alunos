import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

type ProfileRole = "student" | "admin" | "staff" | string;

export type LxpProfile = {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  role: ProfileRole;
  phone?: string | null;
  birth_date?: string | null;
  created_at: string;
  updated_at: string;
};

export type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: LxpProfile | null;
  loading: boolean;
  refetchProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
