import type { AuthChangeEvent } from "@supabase/supabase-js";

/** Evita refetch de perfil e tela de loading em refresh silencioso de token. */
export function shouldRefetchAuthProfile(event: AuthChangeEvent): boolean {
  return event === "SIGNED_IN" || event === "USER_UPDATED";
}
