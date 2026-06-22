export const TEAM_ROLES = ["admin", "coordinator", "professor"] as const;

export type TeamRole = (typeof TEAM_ROLES)[number];

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  admin: "Administrador",
  coordinator: "Coordenador",
  professor: "Professor",
};

export function isTeamRole(value: string | null | undefined): value is TeamRole {
  return !!value && (TEAM_ROLES as readonly string[]).includes(value);
}

export function normalizeTeamRole(value: string | null | undefined): TeamRole {
  if (isTeamRole(value)) return value;
  switch (value) {
    case "secretary":
      return "coordinator";
    case "financial":
      return "admin";
    case "tutor":
    case "commercial":
      return "professor";
    default:
      return "professor";
  }
}

export function formatTeamRoleLabel(role: string | null | undefined): string {
  return TEAM_ROLE_LABELS[normalizeTeamRole(role)];
}
