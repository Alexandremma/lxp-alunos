import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Clock, BookOpen, Trophy, User } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProgressRing } from "@/components/learning/ProgressRing";
import { LessonCard } from "@/components/learning/LessonCard";
import { useTrailDetail } from "@/hooks/queries/useTrailDetail";
import { useCertificateReady } from "@/hooks/queries/useCertificateReady";
import type { TrailModule } from "@/services/trailAdapter";
import { toast } from "sonner";
import { QueryStateCard } from "@/components/states/QueryStateCard";
import { useDisciplineAccess } from "@/hooks/queries/useDisciplineAccess";
import { useAuth } from "@/hooks/use-auth";
import { TrailCertificateCard } from "@/components/learning/TrailCertificateCard";
import { getCertificateDetail } from "@/services/certificateService";
import { downloadCertificatePdf } from "@/services/certificatePdfService";
import { supabase } from "@/lib/supabaseClient";

const TrailDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { trail, modules, lessons, contentStatus, disciplineCompleteXp, isLoading, error } =
    useTrailDetail(id || undefined);
  const { data: access, isLoading: accessLoading } = useDisciplineAccess(id);
  const [isDownloadingCert, setIsDownloadingCert] = useState(false);

  const totalLessonsPreview = lessons.length;
  const completedLessonsPreview = trail?.completedLessons ?? 0;

  const certificateReadyQ = useCertificateReady(
    profile?.id,
    id,
    completedLessonsPreview,
    totalLessonsPreview || trail?.totalLessons || 0,
  );

  const { data: disciplineMeta } = useQuery({
    queryKey: ["lxp", "discipline-meta", id],
    queryFn: async () => {
      const { data, error: qErr } = await supabase
        .from("lxp_course_disciplines")
        .select("workload")
        .eq("id", id!)
        .maybeSingle();
      if (qErr) throw qErr;
      return data as { workload: number | null } | null;
    },
    enabled: Boolean(id),
  });

  if (isLoading || accessLoading) {
    return (
      <DashboardLayout>
        <QueryStateCard state="loading" title="Carregando trilha..." />
      </DashboardLayout>
    );
  }

  if (!trail) {
    return (
      <DashboardLayout>
        <QueryStateCard
          state={error ? "error" : "empty"}
          title={error ? "Nao foi possivel carregar a trilha." : "Trilha não encontrada"}
          description={error ? "Tente novamente em instantes ou volte para a listagem." : undefined}
          actionLabel="Voltar para Disciplinas"
          onAction={() => navigate("/cursos-livres")}
        />
      </DashboardLayout>
    );
  }

  if (access?.allowed === false) {
    return (
      <DashboardLayout>
        <QueryStateCard
          state="empty"
          title={access.title}
          description={access.message}
          actionLabel="Voltar para Disciplinas"
          onAction={() => navigate("/cursos-livres")}
        />
      </DashboardLayout>
    );
  }

  const totalLessons = lessons.length || trail.totalLessons || 0;
  const completedLessons = trail.completedLessons ?? 0;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const lessonsUnavailable = totalLessons === 0 && contentStatus?.state === "unavailable";
  const certificateReady = certificateReadyQ.data === true;
  const moduleLessons = lessons.filter((l) =>
    modules.some((m: TrailModule) => m.id === l.moduleId),
  );
  const primaryActionLabel =
    totalLessons === 0
      ? "Voltar para Minhas Disciplinas"
      : completedLessons > 0
        ? "Continuar"
        : "Iniciar";

  const getNextLessonToStudy = () => {
    const inProgress = lessons.find((l) => l.status === "in_progress");
    if (inProgress) return inProgress;
    return (
      lessons.find((l) => l.status !== "completed" && l.status !== "locked") ??
      lessons.find((l) => l.status !== "locked") ??
      lessons[0] ??
      null
    );
  };

  const handleStartOrContinue = () => {
    const target = getNextLessonToStudy();
    if (target) {
      navigate(`/trails/${trail.id}/lesson/${target.id}`);
      return;
    }
    document.getElementById("trail-modules")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDownloadCertificate = async () => {
    if (!profile?.id || !id) return;
    try {
      setIsDownloadingCert(true);
      const detail = await getCertificateDetail({
        profileId: profile.id,
        courseDisciplineId: id,
        completedLessons,
        totalLessons,
      });
      if (!detail) {
        toast.error("Certificado indisponível. Conclua todas as aulas primeiro.");
        return;
      }
      await downloadCertificatePdf(detail);
      toast.success("Certificado baixado.");
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Não foi possível gerar o certificado.";
      toast.error(message);
    } finally {
      setIsDownloadingCert(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        {/* Back Button */}
        <Link to="/cursos-livres" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Voltar para Disciplinas
        </Link>

        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden">
          <img src={trail.thumbnail ?? "/placeholder.svg"} alt={trail.title} className="w-full h-64 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {trail.category && <Badge variant="secondary" className="mb-3">{trail.category}</Badge>}
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{trail.title}</h1>
            {trail.description ? (
              <p className="text-muted-foreground mt-2 max-w-2xl">{trail.description}</p>
            ) : null}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0"><p className="text-lg font-bold">{trail.totalLessons}</p><p className="text-xs text-muted-foreground">Aulas</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-secondary shrink-0" />
            <div className="min-w-0"><p className="text-lg font-bold">{trail.estimatedHours}h</p><p className="text-xs text-muted-foreground">Duração</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-warning shrink-0" />
            <div className="min-w-0"><p className="text-lg font-bold">+{trail.xpReward}</p><p className="text-xs text-muted-foreground">XP</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <User className="w-5 h-5 text-info shrink-0" />
            <div className="min-w-0"><p className="text-sm font-medium truncate">{trail.instructor}</p><p className="text-xs text-muted-foreground">Instrutor</p></div>
          </CardContent></Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Modules */}
          <div className="lg:col-span-2 space-y-4" id="trail-modules">
            <h2 className="text-xl font-semibold">Módulos</h2>
            {lessonsUnavailable && contentStatus?.state === "unavailable" ? (
              <QueryStateCard
                state="empty"
                title={contentStatus.title}
                description={contentStatus.description}
                actionLabel="Voltar para Disciplinas"
                onAction={() => navigate("/cursos-livres")}
                className="border-warning/30 bg-warning/5"
              />
            ) : modules.length === 0 ? (
              <QueryStateCard
                state="empty"
                title="Carregando módulos..."
                description="Aguarde enquanto organizamos as aulas desta disciplina."
              />
            ) : (
              <Accordion type="single" collapsible defaultValue={modules[0]?.id} className="space-y-3">
                {modules.map((module) => (
                  <AccordionItem key={module.id} value={module.id} className="border rounded-lg bg-card px-4">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${module.status === 'completed' ? 'bg-success text-success-foreground' : module.status === 'in_progress' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          {module.order}
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{module.title}</p>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 space-y-2">
                      {moduleLessons.filter((l) => l.moduleId === module.id).map((lesson) => (
                        <LessonCard key={lesson.id} lesson={lesson} trailId={trail.id} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Seu Progresso</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <ProgressRing progress={progress} size="xl" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{trail.completedLessons} de {trail.totalLessons} aulas concluídas</p>
                </div>
                <Progress value={progress} className="w-full" />
                {disciplineCompleteXp != null && disciplineCompleteXp > 0 && (
                  <p className="text-xs text-center text-muted-foreground w-full">
                    +{disciplineCompleteXp} XP ao concluir todas as aulas desta disciplina
                  </p>
                )}
                <Button
                  className="w-full"
                  onClick={
                    totalLessons === 0
                      ? () => navigate("/cursos-livres")
                      : handleStartOrContinue
                  }
                >
                  {primaryActionLabel}
                </Button>
              </CardContent>
            </Card>
            <TrailCertificateCard
              trailId={trail.id}
              ready={certificateReady}
              readyLoading={certificateReadyQ.isLoading}
              workloadHours={disciplineMeta?.workload ?? null}
              onDownload={() => void handleDownloadCertificate()}
              isDownloading={isDownloadingCert}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrailDetail;
