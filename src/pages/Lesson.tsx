import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
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
import { QueryStateCard } from "@/components/states/QueryStateCard";
import { AliceLessonFrame } from "@/components/learning/AliceLessonFrame";
import { isAliceConfigured } from "@/services/aliceService";
import type {
  Trail as LegacyTrail,
  Module as LegacyModule,
  Lesson as LegacyLesson,
} from "@/data/mockData";

type CompletionDialogMode = "next_lesson" | "trail_complete";

const Lesson = () => {
  const { trailId, lessonId } = useParams();
  const navigate = useNavigate();
  const completeLesson = useCompleteLesson();
  const { profile, user } = useAuth();
  const { trail, modules, lessons: allLessons, isLoading } = useTrailDetail(trailId);
  const { data: access, isLoading: accessLoading } = useDisciplineAccess(trailId);

  const [completionDialogOpen, setCompletionDialogOpen] = React.useState(false);
  const [completionDialogMode, setCompletionDialogMode] =
    React.useState<CompletionDialogMode>("next_lesson");

  const lesson = React.useMemo(
    () => allLessons.find((item) => String(item.id) === String(lessonId)) ?? null,
    [allLessons, lessonId],
  );
  const currentModule = React.useMemo(
    () => modules.find((item) => item.id === lesson?.moduleId) ?? null,
    [modules, lesson?.moduleId],
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

  const totalLessons = allLessons.length;

  // Calculate remaining time
  const remainingLessons = currentLessonIndex >= 0 ? allLessons.slice(currentLessonIndex) : allLessons;
  const remainingTime = remainingLessons.reduce((acc, l) => acc + l.duration, 0);

  return (
    <LessonLayout
      trail={trail as unknown as LegacyTrail}
      modules={modules as unknown as LegacyModule[]}
      currentLesson={lesson as unknown as LegacyLesson}
      allLessons={allLessons as unknown as LegacyLesson[]}
      progress={progress}
      externalDisciplineId={String(trailId)}
      externalUnitId={String(lessonId)}
    >
      <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-6 animate-fade-up">
        {/* Lesson Header Info */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {currentModule && (
            <Badge variant="outline" className="font-normal">
              {currentModule.title}
            </Badge>
          )}
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            Aula {currentLessonIndex + 1} de {totalLessons}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {remainingTime} min restantes
          </span>
        </div>

        {/* Video Player (if video type) */}
        {lesson.type === "video" && (
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

        {/* Lesson Title & Description */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                {lesson.title}
              </h1>
              {lesson.description?.trim() ? (
                <p className="text-muted-foreground mt-2 text-base lg:text-lg">
                  {lesson.description}
                </p>
              ) : null}
            </div>
            {lesson.xpReward > 0 && (
              <Badge
                variant="secondary"
                className="shrink-0 flex items-center gap-1"
                title="Valor configurado em Gamificação → Aula Assistida"
              >
                <Award className="w-3.5 h-3.5" />
                +{lesson.xpReward} XP ao concluir
              </Badge>
            )}
          </div>
        </div>

        {/* Lesson content */}
        <div className="mt-6">
          {lesson.type !== "video" &&
          lesson.aliceContentId &&
          isAliceConfigured() ? (
            <AliceLessonFrame
              contentId={lesson.aliceContentId}
              user={{
                fullName:
                  profile?.name?.trim() ||
                  user?.email?.split("@")[0] ||
                  "Aluno LXP",
                userId: profile?.user_id || user?.id || "",
                email: profile?.email || user?.email || "",
              }}
            />
          ) : lesson.content ? (
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
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Assista ao vídeo acima para acompanhar a aula.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
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
      </div>

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
    </LessonLayout>
  );
};

export default Lesson;
