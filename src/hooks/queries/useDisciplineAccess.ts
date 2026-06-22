import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useTeamModeration } from "@/hooks/useTeamModeration";
import {
  getDisciplineAccessForModerator,
  getDisciplineAccessForStudent,
} from "@/services/disciplineAccessService";

export function useDisciplineAccess(disciplineId: string | undefined) {
  const { profile } = useAuth();
  const { isModerator } = useTeamModeration();

  return useQuery({
    queryKey: ["lxp", "discipline-access", profile?.id, disciplineId, isModerator],
    queryFn: () => {
      if (isModerator) {
        return getDisciplineAccessForModerator(disciplineId!);
      }
      return getDisciplineAccessForStudent(profile!.id, disciplineId!);
    },
    enabled: !!profile?.id && !!disciplineId,
    staleTime: 30_000,
  });
}
