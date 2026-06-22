import { useQuery } from "@tanstack/react-query";
import { normalizeTeamRole, type TeamRole } from "@/consts/teamRoles";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabaseClient";

export type BackofficeMemberContext = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: TeamRole;
  department: string | null;
};

export function useBackofficeMember() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["backoffice", "member", user?.id],
    queryFn: async (): Promise<BackofficeMemberContext | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("backoffice_team_members")
        .select("id,user_id,name,email,role,department")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id as string,
        userId: data.user_id as string,
        name: (data.name as string | null)?.trim() || user.email || "Membro",
        email: (data.email as string | null)?.trim() || user.email || "",
        role: normalizeTeamRole(data.role as string),
        department: (data.department as string | null) ?? null,
      };
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}
