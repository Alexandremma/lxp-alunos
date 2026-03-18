import { useEffect, useMemo, useState } from "react";
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
import { mainCourse, getCourseProgress, type Period, type Subject } from "@/data/mockData";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabaseClient";

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
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{subject.name}</span>
          <span className="text-xs text-muted-foreground">({subject.code})</span>
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
      <div className="flex items-center gap-3">
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
};

const MyCourse = () => {
  const courseProgress = getCourseProgress();
  const completedPeriods = mainCourse.periods.filter((p) => p.status === "completed").length;

  const { profile } = useAuth();

  type EnrolledCourse = {
    id: string;
    name: string;
    description: string | null;
    status: string;
    created_at: string;
  };

  const [currentCourse, setCurrentCourse] = useState<EnrolledCourse | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      if (!profile?.id) return;

      setLoadingCourse(true);

      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("lxp_enrollments")
        .select("course_id")
        .eq("student_profile_id", profile.id)
        .eq("status", "active")
        .limit(1);

      if (enrollmentsError) {
        console.warn("[MyCourse] Erro ao buscar matrículas:", enrollmentsError.message);
        setLoadingCourse(false);
        return;
      }

      const first = (enrollments ?? [])[0];
      if (!first?.course_id) {
        if (isMounted) setCurrentCourse(null);
        setLoadingCourse(false);
        return;
      }

      const { data: courseData, error: courseError } = await supabase
        .from("lxp_courses")
        .select("id,name,description,status,created_at")
        .eq("id", first.course_id)
        .maybeSingle();

      if (courseError) {
        console.warn("[MyCourse] Erro ao buscar curso:", courseError.message);
        setLoadingCourse(false);
        return;
      }

      if (isMounted) {
        setCurrentCourse((courseData as EnrolledCourse) ?? null);
      }
      setLoadingCourse(false);
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

  const courseName = useMemo(
    () => currentCourse?.name ?? mainCourse.name,
    [currentCourse?.name],
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Meu Curso"
          description="Visualize sua grade curricular completa e acompanhe seu progresso acadêmico."
        />

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
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {mainCourse.totalPeriods} períodos
                      </span>
                      <span>•</span>
                      <span>{mainCourse.currentPeriod}º período atual</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progresso do Curso</span>
                  <span className="text-sm text-muted-foreground">
                    {completedPeriods} de {mainCourse.totalPeriods} períodos
                  </span>
                </div>
                <Progress value={courseProgress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1 text-right">{courseProgress}% concluído</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Main Course vs Free Courses */}
        <Tabs defaultValue="grade" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grade">Grade Curricular</TabsTrigger>
            <TabsTrigger value="summary">Resumo Acadêmico</TabsTrigger>
          </TabsList>

          <TabsContent value="grade" className="space-y-4">
            {mainCourse.periods.map((period) => (
              <PeriodCard key={period.id} period={period} />
            ))}
          </TabsContent>

          <TabsContent value="summary">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-muted-foreground">Créditos Cursados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {mainCourse.periods
                      .filter((p) => p.status === "completed")
                      .reduce((acc, p) => acc + p.subjects.reduce((a, s) => a + s.credits, 0), 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    de {mainCourse.periods.reduce((acc, p) => acc + p.subjects.reduce((a, s) => a + s.credits, 0), 0)} totais
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-muted-foreground">Disciplinas Aprovadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">
                    {mainCourse.periods.reduce(
                      (acc, p) => acc + p.subjects.filter((s) => s.status === "approved").length,
                      0
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    de {mainCourse.periods.reduce((acc, p) => acc + p.subjects.length, 0)} no curso
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-muted-foreground">Média Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {(
                      mainCourse.periods
                        .filter((p) => p.status === "completed")
                        .flatMap((p) => p.subjects)
                        .filter((s) => s.grade !== undefined)
                        .reduce((acc, s, _, arr) => acc + (s.grade || 0) / arr.length, 0)
                    ).toFixed(1)}
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
