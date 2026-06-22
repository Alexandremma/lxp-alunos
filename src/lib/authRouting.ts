import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export async function resolvePostLoginPath(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("backoffice_team_members")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[auth] Falha ao verificar equipe:", error.message);
    return "/";
  }

  return data ? "/cursos-livres" : "/";
}

export async function isActiveTeamMember(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("backoffice_team_members")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export function getUserIdFromSession(user: User | null | undefined): string | null {
  return user?.id ?? null;
}
