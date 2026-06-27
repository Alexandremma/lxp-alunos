import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LearningProgressBar } from "@/components/learning/LearningProgressBar";
import { GraduationCap, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useListMyCourseSummaries } from "@/hooks/queries/useListMyCourseSummaries";
import { QueryStateCard } from "@/components/states/QueryStateCard";
import { LoadingLearning } from "@/components/states/LoadingLearning";
import { setLastCourseId } from "@/lib/lastCourseStorage";

const MyCourses = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: courses, isLoading, error, refetch } = useListMyCourseSummaries(profile?.id);

  useEffect(() => {
    if (isLoading || !courses) return;
    if (courses.length === 1) {
      setLastCourseId(courses[0].id);
      navigate(`/meu-curso/${courses[0].id}`, { replace: true });
    }
  }, [courses, isLoading, navigate]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Meus Cursos"
          description="Escolha um curso para ver sua grade curricular e acompanhar o progresso."
        />

        {error && (
          <QueryStateCard
            state="error"
            title="Não foi possível carregar seus cursos."
            description="Tente novamente para atualizar a lista."
            actionLabel="Tentar novamente"
            onAction={() => void refetch()}
            className="border-destructive/30 bg-destructive/5"
          />
        )}

        {isLoading ? (
          <LoadingLearning type="grid" count={6} />
        ) : (courses?.length ?? 0) === 0 ? (
          <QueryStateCard
            state="empty"
            title="Você ainda não possui curso ativo"
            description="Quando sua matrícula for realizada pela instituição, seus cursos aparecerão aqui."
            actionLabel="Ver Minhas Disciplinas"
            onAction={() => navigate("/cursos-livres")}
            className="border-primary/20 bg-gradient-to-br from-primary/5 to-background"
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map((course) => (
              <Link
                key={course.id}
                to={`/meu-curso/${course.id}`}
                onClick={() => setLastCourseId(course.id)}
                className="block group"
              >
                <Card className="h-full card-hover border-primary/10 group-hover:border-primary/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{course.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                    )}
                    <LearningProgressBar
                      value={course.progressPercent}
                      suffix={`${course.completedDisciplines} de ${course.totalDisciplines} disciplinas`}
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyCourses;
