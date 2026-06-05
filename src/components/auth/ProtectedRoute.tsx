import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useStudentAccessGate } from "@/hooks/useStudentAccessGate";

type ProtectedRouteProps = {
  element: ReactElement;
  requiredRole?: "student" | "admin" | "staff" | string;
};

function resolveWrongRoleRedirect(role: string | undefined): string {
  if (role === "admin") return "/admin/cursos";
  return "/login";
}

export const ProtectedRoute = ({ element, requiredRole }: ProtectedRouteProps) => {
  const { session, profile, loading } = useAuth();
  const { checking: checkingAccess } = useStudentAccessGate(
    profile?.id,
    requiredRole === "student" && !!session && !!profile,
  );

  if (loading || checkingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Carregando...
      </div>
    );
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

  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to={resolveWrongRoleRedirect(profile.role)} replace />;
  }

  return element;
};
