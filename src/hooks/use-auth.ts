import { useContext } from "react";
import { AuthContext } from "@/hooks/auth-context";

export type { AuthContextValue, LxpProfile } from "@/types/auth";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
