import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LearningProgressBar } from "@/components/learning/LearningProgressBar";
import { GraduationCap, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useGetMyCourseOverview } from "@/hooks/queries/useGetMyCourseOverview";
import { useListMyCourseSummaries } from "@/hooks/queries/useListMyCourseSummaries";
import { summarizeLinkedCourseProgress } from "@/services/myCourseService";
import { CourseSwitcher } from "@/components/my-course/CourseSwitcher";
import { PeriodCard } from "@/components/my-course/PeriodCard";
import { subjectUsesCredits } from "@/components/my-course/SubjectRow";
import { setLastCourseId } from "@/lib/lastCourseStorage";
import { QueryStateCard } from "@/components/states/QueryStateCard";
import { LoadingLearning } from "@/components/states/LoadingLearning";
import { Skeleton } from "@/components/ui/skeleton";

const MyCourse = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { profile } = useAuth();
  const { data: courseSummaries } = useListMyCourseSummaries(profile?.id);
  const {
    data: currentCourse,
    isLoading: loadingCourse,
    error: courseError,
    refetch: refetchCourse,
  } = useGetMyCourseOverview(profile?.id, courseId);

  useEffect(() => {
    if (courseId) setLastCourseId(courseId);
  }, [courseId]);

  useEffect(() => {
    if (!courseId && profile?.id) {
      navigate("/meu-curso", { replace: true });
    }
  }, [courseId, profile?.id, navigate]);

  const periods = currentCourse?.periods ?? [];

  const courseName = useMemo(
    () => currentCourse?.name ?? (loadingCourse ? "" : "Sem curso ativo"),
    [currentCourse?.name, loadingCourse],
  );
  const allSubjects = useMemo(() => periods.flatMap((p) => p.subjects), [periods]);
  const linkedCourseProgress = useMemo(
    () => summarizeLinkedCourseProgress(allSubjects),
    [allSubjects],
  );
  const { completedDisciplines, totalDisciplines, progressPercent: courseProgress } =
    linkedCourseProgress;
  const totalCredits = useMemo(
    () =>
      periods.reduce(
        (acc, p) =>
          acc + p.subjects.reduce((a, s) => a + (subjectUsesCredits(s) ? s.credits : 0), 0),
        0,
      ),
    [periods],
  );
  const completedCredits = useMemo(
    () =>
      periods
        .filter((p) => p.status === "completed")
        .reduce(
          (acc, p) =>
            acc + p.subjects.reduce((a, s) => a + (subjectUsesCredits(s) ? s.credits : 0), 0),
          0,
        ),
    [periods],
  );
  const hasCreditsInCourse = useMemo(
    () => allSubjects.some((s) => subjectUsesCredits(s)),
    [allSubjects],
  );
  const approvedSubjects = useMemo(
    () => allSubjects.filter((s) => s.isComplete).length,
    [allSubjects],
  );
  const inProgressSubjects = useMemo(
    () => periods.reduce((acc, p) => acc + p.subjects.filter((s) => s.status === "in_progress").length, 0),
    [periods],
  );
  const totalSubjects = useMemo(() => allSubjects.length, [allSubjects]);
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Meu Curso"
          description="Visualize sua grade curricular completa e acompanhe seu progresso acadêmico."
          actions={
            courseId && courseSummaries && courseSummaries.length > 1 ? (
              <CourseSwitcher
                courses={courseSummaries}
                currentCourseId={courseId}
                className="w-full sm:w-[280px]"
              />
            ) : undefined
          }
        />
        {courseError && (
          <QueryStateCard
            state="error"
            title="Não foi possível carregar os dados do curso."
            description="Tente novamente para atualizar a grade curricular."
            actionLabel="Tentar novamente"
            onAction={() => void refetchCourse()}
            className="border-destructive/30 bg-destructive/5"
          />
        )}

        {/* Course Overview */}
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {loadingCourse ? <Skeleton className="h-7 w-48" /> : courseName}
                  </h2>
                  {loadingCourse ? (
                    <div className="mt-2 space-y-2">
                      <Skeleton className="h-4 w-56" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : currentCourse ? (
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Criado em{" "}
                        {new Date(currentCourse.created_at).toLocaleDateString("pt-BR")}
                      </span>
                      <span>•</span>
                      <span>Status: {currentCourse.status}</span>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Nenhum curso ativo encontrado para seu perfil.
                    </p>
                  )}
                </div>
              </div>
              {!loadingCourse && totalDisciplines > 0 && (
                <div className="flex flex-col gap-3 flex-1 max-w-md w-full">
                <LearningProgressBar
                  value={courseProgress}
                  label="Progresso do Curso"
                  suffix={`${completedDisciplines} de ${totalDisciplines} disciplinas`}
                  barClassName="h-3"
                />
                <p className="text-xs text-muted-foreground text-right">{courseProgress}% concluído</p>
              </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!loadingCourse && !currentCourse && (
          <QueryStateCard
            state="empty"
            title="Você ainda não possui curso ativo"
            description="Explore suas disciplinas disponíveis para iniciar seus estudos."
            actionLabel="Ir para Minhas Disciplinas"
            onAction={() => navigate("/cursos-livres")}
            className="border-primary/20 bg-gradient-to-br from-primary/5 to-background"
          />
        )}

        {/* Tabs for Main Course vs Free Courses */}
        <Tabs defaultValue="grade" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grade">Grade Curricular</TabsTrigger>
            <TabsTrigger value="summary">Resumo Acadêmico</TabsTrigger>
          </TabsList>

          <TabsContent value="grade" className="space-y-4">
            {loadingCourse ? (
              <LoadingLearning type="list" count={4} />
            ) : periods.length > 0 ? (
              periods.map((period) => <PeriodCard key={period.id} period={period} />)
            ) : (
              <QueryStateCard
                state="empty"
                title="Nenhuma disciplina disponível no momento."
                description="Quando sua grade for liberada, ela aparecerá aqui."
                className="border-primary/20 bg-gradient-to-br from-primary/5 to-background"
              />
            )}
          </TabsContent>

          <TabsContent value="summary">
            <div className={cn("grid gap-4", hasCreditsInCourse ? "md:grid-cols-3" : "md:grid-cols-2")}>
              {hasCreditsInCourse && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-muted-foreground">Créditos Cursados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {completedCredits}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      de {totalCredits} totais
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-muted-foreground">Disciplinas Aprovadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">
                    {approvedSubjects}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    de {totalSubjects} no curso
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-muted-foreground">Disciplinas em Andamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {inProgressSubjects}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    em progresso agora
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MyCourse;
