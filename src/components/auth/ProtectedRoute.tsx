import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useStudentAccessGate } from "@/hooks/useStudentAccessGate";

type ProtectedRouteProps = {
  element: ReactElement;
  requiredRole?: "student" | "admin" | "staff" | string;
};

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

  if (requiredRole && (!profile || profile.role !== requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return element;
};

