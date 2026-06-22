import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/learning/VideoPlayer";
import { LessonLayout } from "@/components/learning/LessonLayout";
// TODO: Replace mock-based logic with adapters once lesson endpoints are defined.
import { toast } from "sonner";
import { useCompleteLesson } from "@/hooks/mutations/useCompleteLesson";
import { useTrailDetail } from "@/hooks/queries/useTrailDetail";
import { useDisciplineAccess } from "@/hooks/queries/useDisciplineAccess";
import { useAuth } from "@/hooks/use-auth";
import { useTeamModeration } from "@/hooks/useTeamModeration";
import { QueryStateCard } from "@/components/states/QueryStateCard";
import { AliceLessonFrame } from "@/components/learning/AliceLessonFrame";
import { isAliceConfigured } from "@/services/aliceService";
import type { Trail, TrailLesson, TrailModule } from "@/services/trailAdapter";

type CompletionDialogMode = "next_lesson" | "trail_complete";

const Lesson = () => {
  const { trailId, lessonId } = useParams();
  const navigate = useNavigate();
  const completeLesson = useCompleteLesson();
  const { profile, user } = useAuth();
  const { isModerator } = useTeamModeration();
  const { trail, modules, lessons: allLessons, isLoading } = useTrailDetail(trailId, {
    moderationMode: isModerator,
  });
  const { data: access, isLoading: accessLoading } = useDisciplineAccess(trailId);

  const [completionDialogOpen, setCompletionDialogOpen] = React.useState(false);
  const [completionDialogMode, setCompletionDialogMode] =
    React.useState<CompletionDialogMode>("next_lesson");

  const lesson = React.useMemo(
    () => allLessons.find((item) => String(item.id) === String(lessonId)) ?? null,
    [allLessons, lessonId],
  );
  const currentLessonIndex = allLessons.findIndex((l) => String(l.id) === String(lessonId));
  const prev = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const next =
    currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1
      ? allLessons[currentLessonIndex + 1]
      : null;
  const completedLessons = allLessons.filter((item) => item.status === "completed").length;
  const progress = allLessons.length > 0 ? Math.round((completedLessons / allLessons.length) * 100) : 0;

  if (isLoading || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Carregando aula...</p>
        </div>
      </div>
    );
  }

  if (access?.allowed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full">
          <QueryStateCard
            state="empty"
            title={access.title}
            description={access.message}
            actionLabel="Voltar para Disciplinas"
            onAction={() => navigate("/cursos-livres")}
          />
        </div>
      </div>
    );
  }

  if (!lesson || !trail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Aula não encontrada</p>
          <Button variant="outline" onClick={() => navigate("/cursos-livres")}>
            Voltar para Disciplinas
          </Button>
        </div>
      </div>
    );
  }

  if (!isModerator && lesson.status === "locked") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full">
          <QueryStateCard
            state="empty"
            title="Aula bloqueada"
            description="Conclua a aula anterior para desbloquear este conteúdo."
            actionLabel="Voltar para a disciplina"
            onAction={() => navigate(`/trails/${trailId}`)}
          />
        </div>
      </div>
    );
  }

  const isCompleting = completeLesson.isPending;

  const handleComplete = async () => {
    if (lesson.status === "completed" || isCompleting) return;
    try {
      await completeLesson.mutateAsync({
        trailId: String(trailId),
        lessonId: String(lessonId),
        totalLessons: allLessons.length,
      });
      setCompletionDialogMode(next ? "next_lesson" : "trail_complete");
      setCompletionDialogOpen(true);
    } catch {
      toast.error("Não foi possível concluir a aula. Tente novamente.");
    }
  };

  const handleGoToNextLesson = () => {
    setCompletionDialogOpen(false);
    if (next) {
      navigate(`/trails/${trailId}/lesson/${next.id}`);
    }
  };

  const handleStayOnLesson = () => {
    setCompletionDialogOpen(false);
  };

  const handleViewTrailAfterComplete = () => {
    setCompletionDialogOpen(false);
    navigate(`/trails/${trailId}`);
  };

  const handlePrev = () => {
    if (prev) {
      navigate(`/trails/${trailId}/lesson/${prev.id}`);
    }
  };

  const handleNext = () => {
    if (next) {
      navigate(`/trails/${trailId}/lesson/${next.id}`);
      return;
    }
    navigate(`/trails/${trailId}`);
  };

  const isImmersiveEbook =
    lesson.type !== "video" &&
    Boolean(lesson.aliceContentId) &&
    isAliceConfigured();

  const navigationFooter = isModerator ? (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-card shrink-0">
      <Button
        variant="outline"
        onClick={handlePrev}
        disabled={!prev}
        className="gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Anterior</span>
      </Button>
      <span className="text-xs text-muted-foreground text-center px-2">
        Moderação · navegue entre as aulas para revisar comentários
      </span>
      <Button variant="outline" onClick={handleNext} className="gap-2">
        <span className="hidden sm:inline">{next ? "Próxima" : "Voltar à disciplina"}</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  ) : (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-card shrink-0">
      <Button
        variant="outline"
        onClick={handlePrev}
        disabled={!prev}
        className="gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Anterior</span>
      </Button>

      {lesson.status === "completed" ? (
        <Badge variant="outline" className="gap-2 px-3 py-1.5 text-success border-success/30 bg-success/10">
          <CheckCircle2 className="w-4 h-4" />
          Aula concluída
        </Badge>
      ) : (
        <Button onClick={handleComplete} disabled={isCompleting} className="gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {isCompleting ? "Concluindo..." : "Concluir aula"}
        </Button>
      )}

      <Button
        variant="outline"
        onClick={handleNext}
        className="gap-2"
      >
        <span className="hidden sm:inline">{next ? "Próxima" : "Finalizar Disciplina"}</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <LessonLayout
      trail={trail}
      modules={modules}
      currentLesson={lesson}
      allLessons={allLessons}
      progress={progress}
      headerLessonInfo={{
        title: lesson.title,
        description: lesson.description,
        xpReward: isModerator ? undefined : lesson.xpReward,
      }}
      immersiveContent={isImmersiveEbook}
      externalDisciplineId={String(trailId)}
      externalUnitId={String(lessonId)}
      moderationMode={isModerator}
    >
      {isImmersiveEbook ? (
        <div className="h-full flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-hidden">
            <AliceLessonFrame
              contentId={lesson.aliceContentId!}
              fillHeight
              className="h-full"
              user={{
                fullName:
                  profile?.name?.trim() ||
                  user?.email?.split("@")[0] ||
                  "Aluno LXP",
                userId: profile?.user_id || user?.id || "",
                email: profile?.email || user?.email || "",
              }}
            />
          </div>
          {navigationFooter}
        </div>
      ) : (
        <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-6 animate-fade-up">
          {lesson.type === "video" && !isModerator && (
            <div className="rounded-xl overflow-hidden shadow-lg">
              <VideoPlayer
                title={lesson.title}
                duration={lesson.duration}
                onComplete={handleComplete}
                className="w-full"
              />
            </div>
          )}

          {lesson.type !== "video" &&
            !lesson.aliceContentId &&
            lesson.ebookPath && (
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Conteudo de e-book disponivel para esta aula (caderno digital).
                  </p>
                  <p className="text-xs break-all text-muted-foreground">{lesson.ebookPath}</p>
                </CardContent>
              </Card>
            )}

          <div>
            {lesson.content ? (
              <Card>
                <CardContent className="p-6 prose prose-invert max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {lesson.content}
                  </p>
                </CardContent>
              </Card>
            ) : lesson.type === "reading" ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">
                    {isAliceConfigured()
                      ? "O conteúdo desta aula não está disponível no momento. Tente novamente mais tarde ou fale com a instituição."
                      : "O conteúdo de leitura será exibido aqui em breve."}
                  </p>
                </CardContent>
              </Card>
            ) : lesson.type !== "video" ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Assista ao vídeo acima para acompanhar a aula.
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {navigationFooter}
        </div>
      )}

      {!isModerator ? (
      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Parabéns!
            </DialogTitle>
            <DialogDescription>
              {completionDialogMode === "next_lesson"
                ? "Você concluiu esta aula. Deseja seguir para a próxima ou continuar revisando este conteúdo?"
                : "Você concluiu a última aula desta disciplina. Ótimo trabalho!"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleStayOnLesson}>
              Ficar nesta aula
            </Button>
            {completionDialogMode === "next_lesson" ? (
              <Button onClick={handleGoToNextLesson}>
                Ir para a próxima aula
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleViewTrailAfterComplete}>
                Ver disciplina
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      ) : null}
    </LessonLayout>
  );
};

export default Lesson;
