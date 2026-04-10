import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileText,
  Download,
  Clock,
  Award,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/learning/VideoPlayer";
import { LessonLayout } from "@/components/learning/LessonLayout";
// TODO: Replace mock-based logic with adapters once lesson endpoints are defined.
import { toast } from "sonner";
import { useCompleteLesson } from "@/hooks/mutations/useCompleteLesson";
import { useTrailDetail } from "@/hooks/queries/useTrailDetail";
import type {
  Trail as LegacyTrail,
  Module as LegacyModule,
  Lesson as LegacyLesson,
} from "@/data/mockData";

const Lesson = () => {
  const { trailId, lessonId } = useParams();
  const navigate = useNavigate();
  const completeLesson = useCompleteLesson();
  const { trail, modules, lessons: allLessons, isLoading } = useTrailDetail(trailId);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Carregando aula...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !trail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Aula não encontrada</p>
          <Button variant="outline" onClick={() => navigate("/trails")}>
            Voltar para Trilhas
          </Button>
        </div>
      </div>
    );
  }

  const handleComplete = async () => {
    try {
      await completeLesson.mutateAsync({ trailId: String(trailId), lessonId: String(lessonId) });
      toast.success("Aula concluída! 🎉");
      if (next) {
        navigate(`/trails/${trailId}/lesson/${next.id}`);
      }
    } catch {
      toast.error("Não foi possível concluir a aula. Tente novamente.");
    }
  };

  const handlePrev = () => {
    if (prev) {
      navigate(`/trails/${trailId}/lesson/${prev.id}`);
    }
  };

  const handleNext = () => {
    if (next) {
      navigate(`/trails/${trailId}/lesson/${next.id}`);
    }
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

        {/* TODO: Trocar este bloco pelo iframe final (alice_url via rents/list) apos alinhamento final da API externa. */}
        {lesson.ebookPath && lesson.type !== "video" && (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">
                Conteudo de e-book disponivel para esta aula.
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
              <p className="text-muted-foreground mt-2 text-base lg:text-lg">
                {lesson.description}
              </p>
            </div>
            <Badge
              variant="secondary"
              className="shrink-0 flex items-center gap-1"
            >
              <Award className="w-3.5 h-3.5" />
              +{lesson.xpReward} XP
            </Badge>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-auto inline-flex">
            <TabsTrigger value="overview" className="gap-2">
              <FileText className="w-4 h-4 hidden sm:block" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2">
              <Download className="w-4 h-4 hidden sm:block" />
              Recursos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
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
                    O conteúdo de leitura será exibido aqui.
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
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Slides da aula
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PDF • 2.4 MB
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon-sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Material complementar
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PDF • 1.1 MB
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon-sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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

          <Button onClick={handleComplete} className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Concluir aula
          </Button>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={!next}
            className="gap-2"
          >
            <span className="hidden sm:inline">Próxima</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </LessonLayout>
  );
};

export default Lesson;
