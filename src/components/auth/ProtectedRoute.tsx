import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { AppBootstrapScreen } from "@/components/states/AppBootstrapScreen";
import { useAuth } from "@/hooks/use-auth";
import { useStudentAccessGate } from "@/hooks/useStudentAccessGate";
import { useTeamModeration } from "@/hooks/useTeamModeration";
import { isQueryBootstrapping } from "@/lib/routeGuard";

export type RouteAccess = "student" | "teamModerator" | "studentOrTeamModerator";

type ProtectedRouteProps = {
  element: ReactElement;
  access?: RouteAccess;
  /** @deprecated Use `access` instead. */
  requiredRole?: "student" | "admin" | "staff" | string;
};

function resolveAccess(props: ProtectedRouteProps): RouteAccess {
  if (props.access) return props.access;
  if (props.requiredRole === "student") return "student";
  if (props.requiredRole === "admin") return "teamModerator";
  return "studentOrTeamModerator";
}

function isStudentProfile(role: string | undefined): boolean {
  return role === "student";
}

function canAccessRoute(
  access: RouteAccess,
  profileRole: string | undefined,
  isModerator: boolean,
): boolean {
  switch (access) {
    case "student":
      return isStudentProfile(profileRole);
    case "teamModerator":
      return isModerator;
    case "studentOrTeamModerator":
      return isStudentProfile(profileRole) || isModerator;
    default:
      return false;
  }
}

function resolveDeniedRedirect(
  access: RouteAccess,
  profileRole: string | undefined,
  isModerator: boolean,
): string {
  if (access === "student" && isModerator) return "/cursos-livres";
  if (access === "teamModerator" && isStudentProfile(profileRole)) return "/";
  if (access === "studentOrTeamModerator") return "/login";
  return "/login";
}

export const ProtectedRoute = (props: ProtectedRouteProps) => {
  const { element } = props;
  const access = resolveAccess(props);
  const { session, profile, loading: authBootstrapping } = useAuth();
  const { isModerator, member, isPending: memberPending } = useTeamModeration();
  const memberBootstrapping = isQueryBootstrapping(memberPending, member ?? undefined);

  const requiresStudentGate =
    access === "student" &&
    !!session &&
    !!profile &&
    isStudentProfile(profile.role);

  const { checking: checkingAccess } = useStudentAccessGate(
    profile?.id,
    requiresStudentGate,
  );

  const needsModerationCheck =
    access === "teamModerator" || access === "studentOrTeamModerator";

  const isBootstrapping =
    authBootstrapping ||
    checkingAccess ||
    (needsModerationCheck && memberBootstrapping);

  if (isBootstrapping) {
    return <AppBootstrapScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
        <p>Não foi possível carregar seu perfil.</p>
        <p>Faça logout e entre novamente. Se o problema persistir, contate o suporte.</p>
      </div>
    );
  }

  if (!canAccessRoute(access, profile.role, isModerator)) {
    return (
      <Navigate
        to={resolveDeniedRedirect(access, profile.role, isModerator)}
        replace
      />
    );
  }

  return element;
};
