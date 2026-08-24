import * as React from "react";
import { Link } from "react-router-dom";
import { X, ChevronLeft, Eye, EyeOff, StickyNote, MessageCircle, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Award } from "lucide-react";
import { LessonSidebar } from "./LessonSidebar";
import { AiTutorFab } from "./AiTutorFab";
import { AiTutorSidebar } from "./AiTutorSidebar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { LessonDiscussionPanel } from "@/components/learning/LessonDiscussionPanel";
import { LessonNotesPanel } from "@/components/learning/LessonNotesPanel";
import type { Trail, TrailModule as Module, TrailLesson as Lesson } from "@/services/trailAdapter";

export interface LessonHeaderInfo {
  title: string;
  description?: string | null;
  xpReward?: number;
}

interface LessonLayoutProps {
  children: React.ReactNode;
  trail: Trail;
  modules: Module[];
  currentLesson: Lesson;
  allLessons: Lesson[];
  progress: number;
  /** Título, descrição e XP exibidos no header central (substituem a barra de progresso). */
  headerLessonInfo?: LessonHeaderInfo;
  /** E-book imersivo: main sem scroll da página — só o iframe rola. */
  immersiveContent?: boolean;
  /** IDs usados em progresso/comentários (trailId + lessonId). */
  externalDisciplineId?: string;
  externalUnitId?: string;
  /** `rent.hash` Alice para o Tutor MAIA; sem hash o tutor fica desabilitado. */
  aliceRentHash?: string;
  moderationMode?: boolean;
}

export const LessonLayout = ({
  children,
  trail,
  modules,
  currentLesson,
  allLessons,
  progress,
  headerLessonInfo,
  immersiveContent = false,
  externalDisciplineId,
  externalUnitId,
  aliceRentHash,
  moderationMode = false,
}: LessonLayoutProps) => {
  const isMobile = useIsMobile();
  const [leftSidebarOpen, setLeftSidebarOpen] = React.useState(true);
  const [rightPanel, setRightPanel] = React.useState<'notes' | 'discussion' | null>(
    moderationMode ? 'discussion' : null,
  );
  const [aiTutorOpen, setAiTutorOpen] = React.useState(false);

  React.useEffect(() => {
    if (moderationMode) {
      setRightPanel('discussion');
      setAiTutorOpen(false);
    }
  }, [moderationMode, externalUnitId]);

  const closeRightPanel = () => setRightPanel(null);

  const toggleNotes = () => {
    setRightPanel(rightPanel === 'notes' ? null : 'notes');
    setAiTutorOpen(false);
  };

  const toggleDiscussion = () => {
    setRightPanel(rightPanel === 'discussion' ? null : 'discussion');
    setAiTutorOpen(false);
  };

  const toggleAiTutor = () => {
    setAiTutorOpen(!aiTutorOpen);
    if (!aiTutorOpen) {
      setRightPanel(null);
    }
  };

  return (
    <TooltipProvider>
      <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
        {/* Top Header */}
        <header
          className={cn(
            "border-b border-border bg-card flex items-center justify-between px-4 shrink-0",
            headerLessonInfo?.description?.trim() ? "py-2 min-h-14" : "h-14",
          )}
        >
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <Eye className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  <LessonSidebar
                    trail={trail}
                    modules={modules}
                    currentLesson={currentLesson}
                    allLessons={allLessons}
                    progress={progress}
                    onLessonClick={() => {}}
                    allowLockedNavigation={moderationMode}
                  />
                </SheetContent>
              </Sheet>
            )}

            {/* Logo + Back */}
            <Link
              to={`/trails/${trail.id}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <div className="hidden sm:flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">{trail.title}</span>
              </div>
            </Link>
          </div>

          {/* Lesson title / description / XP (barra de progresso ficou na sidebar) */}
          {headerLessonInfo && (
            <div className="flex-1 min-w-0 mx-3 sm:mx-4 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-semibold text-foreground truncate sm:whitespace-normal sm:line-clamp-1">
                  {headerLessonInfo.title}
                </h1>
                {headerLessonInfo.description?.trim() ? (
                  <p className="hidden sm:block text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {headerLessonInfo.description}
                  </p>
                ) : null}
              </div>
              {(headerLessonInfo.xpReward ?? 0) > 0 && (
                <Badge
                  variant="secondary"
                  className="shrink-0 hidden sm:flex items-center gap-1 text-xs"
                  title="Valor configurado em Gamificação → Aula Assistida"
                >
                  <Award className="w-3 h-3" />
                  +{headerLessonInfo.xpReward} XP
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Reading Mode Toggle - Desktop only */}
            {!isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                    className={cn(
                      "text-muted-foreground",
                      !leftSidebarOpen && "text-primary bg-primary/10"
                    )}
                  >
                    {leftSidebarOpen ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {leftSidebarOpen ? "Modo leitura" : "Mostrar navegação"}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Notes Button */}
            {!moderationMode && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggleNotes}
                  className={cn(
                    "text-muted-foreground",
                    rightPanel === 'notes' && "text-primary bg-primary/10"
                  )}
                >
                  <StickyNote className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Anotações</TooltipContent>
            </Tooltip>
            )}

            {/* Discussion Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggleDiscussion}
                  className={cn(
                    "text-muted-foreground",
                    rightPanel === 'discussion' && "text-primary bg-primary/10"
                  )}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Discussão</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Desktop only */}
          {!isMobile && (
            <aside
              className={cn(
                "border-r border-border bg-card overflow-y-auto transition-all duration-300 shrink-0",
                leftSidebarOpen ? "w-80" : "w-0"
              )}
            >
              {leftSidebarOpen && (
                <LessonSidebar
                  trail={trail}
                  modules={modules}
                  currentLesson={currentLesson}
                  allLessons={allLessons}
                  progress={progress}
                  onLessonClick={() => {}}
                />
              )}
            </aside>
          )}

          {/* Content */}
          <main
            className={cn(
              "flex-1 relative min-h-0",
              immersiveContent
                ? "flex flex-col overflow-hidden"
                : "overflow-y-auto scrollbar-thin",
            )}
          >
            {children}
            
            {/* AI Tutor FAB */}
            {!moderationMode && !aiTutorOpen && (
              <AiTutorFab
                onClick={toggleAiTutor}
                className={immersiveContent ? "bottom-20" : undefined}
              />
            )}
          </main>

          {/* AI Tutor Sidebar */}
          {!moderationMode && aiTutorOpen && (
            <aside className="border-l border-border bg-card shrink-0 h-full w-80 lg:w-96 overflow-hidden">
              <AiTutorSidebar
                lessonTitle={currentLesson.title}
                rentHash={aliceRentHash}
                onClose={() => setAiTutorOpen(false)}
              />
            </aside>
          )}

          {/* Right Sidebar - Notes & Discussion */}
          <aside
            className={cn(
              "border-l border-border bg-card overflow-hidden transition-all duration-300 shrink-0",
              rightPanel ? "w-80 lg:w-96" : "w-0"
            )}
          >
            {rightPanel && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">
                      {rightPanel === 'notes' ? 'Anotações' : 'Discussão'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rightPanel === 'notes'
                        ? 'Suas notas para esta aula'
                        : moderationMode
                          ? 'Moderação de comentários desta aula'
                          : 'Comentários e perguntas'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={closeRightPanel}
                    aria-label="Fechar painel"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {rightPanel === 'notes' ? (
                    externalDisciplineId && externalUnitId ? (
                      <LessonNotesPanel
                        externalDisciplineId={externalDisciplineId}
                        externalUnitId={externalUnitId}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Anotações indisponíveis para esta aula.
                      </p>
                    )
                  ) : externalDisciplineId && externalUnitId ? (
                    <LessonDiscussionPanel
                      externalDisciplineId={externalDisciplineId}
                      externalUnitId={externalUnitId}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Discussão indisponível para esta aula.
                    </p>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </TooltipProvider>
  );
};
