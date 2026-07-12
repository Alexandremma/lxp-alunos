import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/consts/queryKeys";
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
    queryKey: queryKeys.discipline.access(profile?.id, disciplineId, isModerator),
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
