import type { AuthChangeEvent } from "@supabase/supabase-js";

/** Evita refetch de perfil em refresh silencioso de token. */
export function shouldRefetchAuthProfile(event: AuthChangeEvent): boolean {
  return event === "SIGNED_IN" || event === "USER_UPDATED";
}

/** Bloqueia a UI só quando ainda não há perfil em cache para o usuário atual. */
export function shouldBlockUiForAuthProfileFetch(
  event: AuthChangeEvent,
  hasProfileForCurrentUser: boolean,
): boolean {
  return shouldRefetchAuthProfile(event) && !hasProfileForCurrentUser;
}
