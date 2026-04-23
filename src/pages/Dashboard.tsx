import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, BookOpen, Clock, Trophy, Sparkles, BookOpenCheck, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FeedbackBadge } from "@/components/learning/FeedbackBadge";
import { ActivityChecklist } from "@/components/learning/ActivityChecklist";
import { useAuth } from "@/hooks/use-auth";
import { useGetActiveEnrolledCourses } from "@/hooks/queries/useGetActiveEnrolledCourses";
import { QueryStateCard } from "@/components/states/QueryStateCard";
import { useStudentCatalog } from "@/hooks/queries/useStudentCatalog";
import { useContinueTrail } from "@/hooks/useContinueTrail";
import { toast } from "sonner";
import { useDashboardStats } from "@/hooks/queries/useDashboardStats";

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { resolveNextPath } = useContinueTrail();
  const [resolvingTrailId, setResolvingTrailId] = useState<string | null>(null);

  const {
    data: enrolledCoursesData,
    isLoading: loadingEnrollments,
    error: enrollmentsError,
    refetch: refetchEnrollments,
  } = useGetActiveEnrolledCourses(profile?.id);
  const enrolledCourses = useMemo(() => enrolledCoursesData ?? [], [enrolledCoursesData]);
  const {
    items: catalogItems,
    isLoading: loadingCatalog,
    error: catalogError,
    refetch: refetchCatalog,
  } = useStudentCatalog({ page: 1, pageSize: 8 });
  const {
    data: dashboardStats,
    error: statsError,
    refetch: refetchStats,
  } = useDashboardStats(profile?.id);

  const displayName = useMemo(() => {
    const candidate = (profile?.name ?? "").trim();
    if (!candidate) return "Aluno";
    return candidate.split(" ")[0];
  }, [profile?.name]);

  const currentCourse = enrolledCourses[0];
  const hasNoEnrolledCourses = !loadingEnrollments && enrolledCourses.length === 0;
  const stats = dashboardStats ?? {
    streak: 0,
    level: 1,
    totalXp: 0,
    completedTrails: 0,
    totalLessonsCompleted: 0,
    totalHoursStudied: 0,
  };
  const inProgressTrails = useMemo(
    () =>
      catalogItems
        .filter((item) => item.enrolled && (item.progressPercent ?? 0) < 100)
        .slice(0, 4),
    [catalogItems],
  );

  const handleContinueTrail = async (trailId: string) => {
    try {
      setResolvingTrailId(trailId);
      const nextPath = await resolveNextPath(trailId);
      navigate(nextPath);
    } catch {
      toast.error("Nao foi possivel continuar a trilha agora.");
    } finally {
      setResolvingTrailId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Olá, {displayName}! <Sparkles className="inline w-6 h-6 text-warning" />
            </h1>
            <p className="text-muted-foreground mt-1">
              {hasNoEnrolledCourses
                ? "Bem-vindo ao LXP! Comece explorando nossos cursos disponíveis."
                : "Continue sua jornada de aprendizado. Você está indo muito bem!"}
            </p>
          </div>
          <div className="flex gap-3">
            <FeedbackBadge type="streak" value={stats.streak} label="dias seguidos" />
            <FeedbackBadge type="level" value={`Nível ${stats.level}`} label={`${stats.totalXp} XP`} />
          </div>
        </div>
        {statsError && (
          <QueryStateCard
            state="error"
            title="Nao foi possivel atualizar seus indicadores."
            description="Os dados de trilhas continuam disponíveis; tente atualizar os KPI."
            actionLabel="Atualizar KPI"
            onAction={() => void refetchStats()}
          />
        )}

        {/* Curso matriculado (fonte real do Supabase) */}
        {enrollmentsError && (
          <QueryStateCard
            state="error"
            title="Não foi possível carregar sua matrícula agora."
            description="Você pode tentar novamente sem sair da tela."
            actionLabel="Tentar novamente"
            onAction={() => void refetchEnrollments()}
            className="border-destructive/30 bg-destructive/5"
          />
        )}
        {loadingEnrollments && (
          <QueryStateCard
            state="loading"
            title="Carregando seu curso atual..."
            className="border-primary/20 bg-gradient-to-br from-primary/5 to-background"
          />
        )}
        {currentCourse && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Seu curso atual
                  </p>
                  <h3 className="text-lg font-semibold text-foreground">{currentCourse.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {currentCourse.description ?? "Sem descrição"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link to="/meu-curso">
                  <Button className="glow-sm">Ver no Meu Curso</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalXp}</p>
                <p className="text-xs text-muted-foreground">XP Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-success/10">
                <Trophy className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.completedTrails}</p>
                <p className="text-xs text-muted-foreground">Trilhas Concluídas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-secondary/10">
                <BookOpen className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalLessonsCompleted}</p>
                <p className="text-xs text-muted-foreground">Aulas Concluídas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalHoursStudied}h</p>
                <p className="text-xs text-muted-foreground">Horas Estudadas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State - No Courses */}
        {hasNoEnrolledCourses ? (
          <>
            {/* Welcome Message for New Users */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <BookOpenCheck className="w-12 h-12 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">
                      Bem-vindo ao LXP! 🎉
                    </h2>
                    <p className="text-muted-foreground max-w-md">
                      Você ainda não está inscrito em nenhum curso. Explore nossa biblioteca de cursos e comece sua jornada de aprendizado!
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link to="/cursos-livres">
                      <Button size="lg" className="glow-sm">
                        Explorar Cursos
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link to="/portfolio">
                      <Button size="lg" variant="outline">
                        Ver Portfólio
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Courses (hidden until real catalog recommendation is wired) */}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Comece Agora</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Link to="/cursos-livres">
                    <Card className="card-hover cursor-pointer h-full">
                      <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground">Explorar Cursos</h3>
                        <p className="text-xs text-muted-foreground">
                          Descubra trilhas de aprendizado disponíveis
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to="/portfolio">
                    <Card className="card-hover cursor-pointer h-full">
                      <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                        <div className="p-3 rounded-lg bg-success/10">
                          <Trophy className="w-6 h-6 text-success" />
                        </div>
                        <h3 className="font-semibold text-foreground">Ver Conquistas</h3>
                        <p className="text-xs text-muted-foreground">
                          Visualize badges e certificados
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to="/progress">
                    <Card className="card-hover cursor-pointer h-full">
                      <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                        <div className="p-3 rounded-lg bg-secondary/10">
                          <Sparkles className="w-6 h-6 text-secondary" />
                        </div>
                        <h3 className="font-semibold text-foreground">Meu Progresso</h3>
                        <p className="text-xs text-muted-foreground">
                          Acompanhe sua evolução
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Continue Learning */}
            {/* Hidden until trail progress is wired */}

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Trails in Progress */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Trilhas em Andamento</h2>
                  <Link to="/cursos-livres" className="text-sm text-primary hover:underline">
                    Ver todas
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {loadingCatalog ? (
                    <QueryStateCard
                      state="loading"
                      title="Carregando trilhas em andamento..."
                      className="md:col-span-2"
                    />
                  ) : catalogError ? (
                    <QueryStateCard
                      state="error"
                      title="Nao foi possivel carregar suas trilhas."
                      description="Tente novamente para atualizar seus estudos em andamento."
                      actionLabel="Tentar novamente"
                      onAction={() => void refetchCatalog()}
                      className="md:col-span-2"
                    />
                  ) : inProgressTrails.length === 0 ? (
                    <QueryStateCard
                      state="empty"
                      title="Nenhuma trilha em andamento"
                      description="Quando voce iniciar uma trilha, ela aparecera aqui."
                      className="md:col-span-2"
                    />
                  ) : (
                    inProgressTrails.map((trail) => {
                      const progress = Math.max(0, Math.min(100, trail.progressPercent ?? 0));
                      return (
                        <Card key={trail.id} className="card-hover">
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <p className="font-semibold text-foreground line-clamp-1">{trail.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {trail.description ?? "Disciplina em andamento"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Progresso</span>
                                <span className="font-medium">{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                            <Button
                              className="w-full"
                              onClick={() => void handleContinueTrail(trail.id)}
                              disabled={resolvingTrailId === trail.id}
                            >
                              {resolvingTrailId === trail.id ? "Abrindo..." : "Continuar"}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Upcoming Activities */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Próximas Atividades</h2>
                  <span className="text-xs text-muted-foreground">—</span>
                </div>
                <Card>
                  <CardContent className="p-2">
                    <ActivityChecklist activities={[]} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
