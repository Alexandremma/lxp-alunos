import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useListMyCourseSummaries } from "@/hooks/queries/useListMyCourseSummaries";
import { getLastCourseId } from "@/lib/lastCourseStorage";
import { LoadingLearning } from "@/components/states/LoadingLearning";

const MyCourseRedirect = () => {
  const { profile } = useAuth();
  const { data: courses, isLoading } = useListMyCourseSummaries(profile?.id);

  if (isLoading) {
    return <LoadingLearning type="card" />;
  }

  const lastId = getLastCourseId();
  const enrolledIds = new Set((courses ?? []).map((c) => c.id));

  if (lastId && enrolledIds.has(lastId)) {
    return <Navigate to={`/meu-curso/${lastId}`} replace />;
  }

  if ((courses?.length ?? 0) === 1) {
    return <Navigate to={`/meu-curso/${courses![0].id}`} replace />;
  }

  return <Navigate to="/meus-cursos" replace />;
};

export default MyCourseRedirect;
