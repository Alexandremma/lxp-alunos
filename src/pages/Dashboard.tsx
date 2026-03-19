import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Zap, BookOpen, Clock, ChevronRight, Trophy, Sparkles, BookOpenCheck, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FeedbackBadge } from "@/components/learning/FeedbackBadge";
import { ActivityChecklist } from "@/components/learning/ActivityChecklist";
import { TrailCard } from "@/components/learning/TrailCard";
import { currentStudent, trails, upcomingActivities, getStudentStats, freeCourses } from "@/data/mockData";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabaseClient";

const Dashboard = () => {
  const stats = getStudentStats();
  const inProgressTrails = trails.filter((t) => t.status === "in_progress").slice(0, 2);
  const continueTrail = inProgressTrails[0];
  const hasNoMockCourses = trails.length === 0;
  const suggestedCourses = freeCourses.slice(0, 3);

  const { profile } = useAuth();

  type EnrolledCourse = {
    id: string;
    name: string;
    description: string | null;
    status: "active" | "draft" | "archived";
    created_at: string;
  };

  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      if (!profile?.id) return;

      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("lxp_enrollments")
        .select("course_id")
        .eq("student_profile_id", profile.id);

      if (enrollmentsError) {
        console.warn("[Dashboard] Erro ao buscar matrículas:", enrollmentsError.message);
        return;
      }

      const courseIds = Array.from(
        new Set((enrollmentsData ?? []).map((e) => e.course_id)),
      );

      if (courseIds.length === 0) {
        if (isMounted) setEnrolledCourses([]);
        return;
      }

      const { data: coursesData, error: coursesError } = await supabase
        .from("lxp_courses")
        .select("id,name,description,status,created_at")
        .in("id", courseIds);

      if (coursesError) {
        console.warn("[Dashboard] Erro ao buscar cursos:", coursesError.message);
        return;
      }

      if (isMounted) setEnrolledCourses((coursesData ?? []) as EnrolledCourse[]);
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

  const displayName = useMemo(() => {
    const fallback = currentStudent.name.split(" ")[0];
    const candidate = profile?.name ?? "";
    if (!candidate.trim()) return fallback;
    return candidate.split(" ")[0];
  }, [profile?.name]);

  const currentCourse = enrolledCourses[0];
  const hasNoEnrolledCourses = enrolledCourses.length === 0;

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

        {/* Curso matriculado (fonte real do Supabase) */}
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

            {/* Suggested Courses */}
            {suggestedCourses.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    Cursos Recomendados para Você
                  </h2>
                  <Link to="/cursos-livres" className="text-sm text-primary hover:underline">
                    Ver todos
                  </Link>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {suggestedCourses.map((course) => (
                    <Card key={course.id} className="overflow-hidden card-hover group">
                      <div className="relative h-40">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{course.workload}h</span>
                          </div>
                          <Link to="/cursos-livres">
                            <Button size="sm" variant="outline">
                              Ver Detalhes
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

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
            {continueTrail && (
              <Card className="overflow-hidden border-primary/20">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-48 md:h-auto">
                      <img
                        src={continueTrail.thumbnail}
                        alt={continueTrail.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">
                          Continue de onde parou
                        </p>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {continueTrail.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {continueTrail.description}
                        </p>
                      </div>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {continueTrail.completedLessons}/{continueTrail.totalLessons} aulas
                          </span>
                          <span className="font-medium">
                            {Math.round((continueTrail.completedLessons / continueTrail.totalLessons) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={(continueTrail.completedLessons / continueTrail.totalLessons) * 100}
                          className="h-2"
                        />
                        <div className="pt-1">
                          <Link to={`/trails/${continueTrail.id}`}>
                            <Button className="w-full md:w-auto glow-sm">
                              Continuar Aprendendo
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Trails in Progress */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Trilhas em Andamento</h2>
                  <Link to="/trails" className="text-sm text-primary hover:underline">
                    Ver todas
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {inProgressTrails.map((trail) => (
                    <TrailCard key={trail.id} trail={trail} />
                  ))}
                </div>
              </div>

              {/* Upcoming Activities */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Próximas Atividades</h2>
                  <span className="text-xs text-muted-foreground">
                    {upcomingActivities.length} pendentes
                  </span>
                </div>
                <Card>
                  <CardContent className="p-2">
                    <ActivityChecklist activities={upcomingActivities} />
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
