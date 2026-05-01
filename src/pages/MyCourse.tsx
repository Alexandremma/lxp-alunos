import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  BookOpen, 
  ChevronDown, 
  ChevronRight,
  GraduationCap,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type Period, type Subject } from "@/data/mockData";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/use-auth";
import { useGetMyCourseOverview } from "@/hooks/queries/useGetMyCourseOverview";
import { QueryStateCard } from "@/components/states/QueryStateCard";

const statusConfig = {
  completed: { label: "Concluído", color: "bg-success/10 text-success border-success/20", icon: CheckCircle },
  current: { label: "Em Curso", color: "bg-primary/10 text-primary border-primary/20", icon: Clock },
  future: { label: "Futuro", color: "bg-muted text-muted-foreground border-muted", icon: BookOpen },
};

const subjectStatusConfig = {
  approved: { label: "Aprovado", color: "bg-success/10 text-success" },
  in_progress: { label: "Cursando", color: "bg-primary/10 text-primary" },
  pending: { label: "Pendente", color: "bg-muted text-muted-foreground" },
  failed: { label: "Reprovado", color: "bg-destructive/10 text-destructive" },
};

/** Disciplinas vindas do Supabase usam UUID; o mock antigo não — só linkamos quando for UUID. */
const DISCIPLINE_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PeriodCard = ({ period }: { period: Period }) => {
  const [isOpen, setIsOpen] = useState(period.status === "current");
  const StatusIcon = statusConfig[period.status].icon;

  const totalCredits = period.subjects.reduce((acc, s) => acc + s.credits, 0);
  const approvedSubjects = period.subjects.filter((s) => s.status === "approved").length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn(
        "transition-all duration-200",
        period.status === "current" && "border-primary/30 shadow-md"
      )}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  statusConfig[period.status].color
                )}>
                  <StatusIcon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{period.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {period.subjects.length} disciplinas • {totalCredits} créditos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {period.status === "completed" && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    {approvedSubjects}/{period.subjects.length} aprovadas
                  </Badge>
                )}
                {period.status === "current" && (
                  <Badge className="bg-primary text-primary-foreground">
                    Período Atual
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {period.subjects.map((subject) => (
                <SubjectRow key={subject.id} subject={subject} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const SubjectRow = ({ subject }: { subject: Subject }) => {
  const canOpenDisciplineTrail = DISCIPLINE_UUID_RE.test(subject.id);

  const row = (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg bg-muted/30 transition-colors",
        canOpenDisciplineTrail && "hover:bg-muted/60",
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm group-hover:text-primary transition-colors">
            {subject.name}
          </span>
          <span className="text-xs text-muted-foreground">({subject.code})</span>
          {canOpenDisciplineTrail && (
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
              Abrir disciplina
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span>{subject.credits} créditos</span>
          <span>•</span>
          <span>{subject.workload}h</span>
          {subject.professor && (
            <>
              <span>•</span>
              <span>{subject.professor}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {subject.grade !== undefined && (
          <span className={cn(
            "font-semibold text-sm",
            subject.grade >= 7 ? "text-success" : subject.grade >= 5 ? "text-warning" : "text-destructive"
          )}>
            {subject.grade.toFixed(1)}
          </span>
        )}
        <Badge variant="outline" className={subjectStatusConfig[subject.status].color}>
          {subjectStatusConfig[subject.status].label}
        </Badge>
      </div>
    </div>
  );

  if (canOpenDisciplineTrail) {
    return (
      <Link
        to={`/trails/${subject.id}`}
        className="block rounded-lg group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {row}
      </Link>
    );
  }

  return row;
};

const MyCourse = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    data: currentCourse,
    isLoading: loadingCourse,
    error: courseError,
    refetch: refetchCourse,
  } = useGetMyCourseOverview(profile?.id);

  const periods = useMemo<Period[]>(
    () =>
      currentCourse?.periods?.map((period) => ({
        id: period.id,
        number: period.number,
        name: period.name,
        status: period.status,
        subjects: period.subjects.map((subject) => ({
          id: subject.id,
          name: subject.name,
          code: subject.code,
          credits: subject.credits,
          workload: subject.workload,
          status: subject.status,
          grade: subject.grade,
          professor: subject.professor,
        })),
      })) ?? [],
    [currentCourse?.periods],
  );

  const courseName = useMemo(() => currentCourse?.name ?? "Sem curso ativo", [currentCourse?.name]);
  const completedPeriods = useMemo(() => periods.filter((p) => p.status === "completed").length, [periods]);
  const totalPeriods = periods.length || 1;
  const courseProgress = Math.round((completedPeriods / totalPeriods) * 100);
  const totalCredits = useMemo(
    () => periods.reduce((acc, p) => acc + p.subjects.reduce((a, s) => a + s.credits, 0), 0),
    [periods],
  );
  const completedCredits = useMemo(
    () =>
      periods
        .filter((p) => p.status === "completed")
        .reduce((acc, p) => acc + p.subjects.reduce((a, s) => a + s.credits, 0), 0),
    [periods],
  );
  const approvedSubjects = useMemo(
    () => periods.reduce((acc, p) => acc + p.subjects.filter((s) => s.status === "approved").length, 0),
    [periods],
  );
  const inProgressSubjects = useMemo(
    () => periods.reduce((acc, p) => acc + p.subjects.filter((s) => s.status === "in_progress").length, 0),
    [periods],
  );
  const totalSubjects = useMemo(() => periods.reduce((acc, p) => acc + p.subjects.length, 0), [periods]);
  const approvedWithGrades = useMemo(
    () =>
      periods
        .flatMap((p) => p.subjects)
        .filter((s) => s.status === "approved" && s.grade !== undefined),
    [periods],
  );
  const averageGrade = useMemo(() => {
    if (approvedWithGrades.length === 0) return 0;
    return approvedWithGrades.reduce((acc, s) => acc + (s.grade ?? 0), 0) / approvedWithGrades.length;
  }, [approvedWithGrades]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Meu Curso"
          description="Visualize sua grade curricular completa e acompanhe seu progresso acadêmico."
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
                    {courseName}
                  </h2>
                  {loadingCourse ? (
                    <p className="mt-1 text-sm text-muted-foreground">Carregando informações do curso...</p>
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
              <div className="flex-1 max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progresso do Curso</span>
                  <span className="text-sm text-muted-foreground">
                    {completedPeriods} de {totalPeriods} períodos
                  </span>
                </div>
                <Progress value={courseProgress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1 text-right">{courseProgress}% concluído</p>
              </div>
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
            {periods.length > 0 ? (
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
            <div className="grid md:grid-cols-4 gap-4">
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

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-muted-foreground">Média Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {averageGrade.toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground">coeficiente de rendimento</p>
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
