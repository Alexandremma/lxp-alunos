import { useBackofficeMember } from "@/hooks/queries/useBackofficeMember";
import { formatTeamRoleLabel, type TeamRole } from "@/consts/teamRoles";

export function useTeamModeration() {
  const { data: member, isLoading, isFetching } = useBackofficeMember();

  const isModerator = !!member;
  const teamRole: TeamRole | null = member?.role ?? null;
  const teamRoleLabel = teamRole ? formatTeamRoleLabel(teamRole) : null;

  return {
    member,
    isModerator,
    isLoading,
    isFetching,
    teamRole,
    teamRoleLabel,
    canModerateComments: isModerator,
  };
}
