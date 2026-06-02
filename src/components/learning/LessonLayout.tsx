import * as React from "react";
import { Link } from "react-router-dom";
import { X, ChevronLeft, Eye, EyeOff, StickyNote, MessageCircle, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { LessonSidebar } from "./LessonSidebar";
import { AiTutorFab } from "./AiTutorFab";
import { AiTutorSidebar } from "./AiTutorSidebar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { LessonDiscussionPanel } from "@/components/learning/LessonDiscussionPanel";
import { LessonNotesPanel } from "@/components/learning/LessonNotesPanel";
import type { Trail, TrailModule as Module, TrailLesson as Lesson } from "@/services/trailAdapter";

interface LessonLayoutProps {
  children: React.ReactNode;
  trail: Trail;
  modules: Module[];
  currentLesson: Lesson;
  allLessons: Lesson[];
  progress: number;
  /** IDs usados em progresso/comentários (trailId + lessonId). */
  externalDisciplineId?: string;
  externalUnitId?: string;
}

export const LessonLayout = ({
  children,
  trail,
  modules,
  currentLesson,
  allLessons,
  progress,
  externalDisciplineId,
  externalUnitId,
}: LessonLayoutProps) => {
  const isMobile = useIsMobile();
  const [leftSidebarOpen, setLeftSidebarOpen] = React.useState(true);
  const [rightPanel, setRightPanel] = React.useState<'notes' | 'discussion' | null>(null);
  const [aiTutorOpen, setAiTutorOpen] = React.useState(false);

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
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
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
                    onLessonClick={() => {}}
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

          {/* Progress */}
          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <div className="flex items-center gap-3">
              <Progress value={progress} className="h-2 flex-1" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {progress}% concluído
              </span>
            </div>
          </div>

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
                  onLessonClick={() => {}}
                />
              )}
            </aside>
          )}

          {/* Content */}
          <main className="flex-1 overflow-y-auto scrollbar-thin relative">
            {children}
            
            {/* AI Tutor FAB */}
            {!aiTutorOpen && (
              <AiTutorFab onClick={toggleAiTutor} />
            )}
          </main>

          {/* AI Tutor Sidebar */}
          {aiTutorOpen && (
            <aside className="border-l border-border bg-card shrink-0 h-full w-80 lg:w-96 overflow-hidden">
              <AiTutorSidebar
                lessonTitle={currentLesson.title}
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
