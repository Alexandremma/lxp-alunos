import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  FileText,
  HelpCircle,
  FolderKanban,
  MessageCircle,
  CheckCircle2,
  Circle,
  Lock,
  ChevronDown,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Trail, TrailModule as Module, TrailLesson as Lesson } from "@/services/trailAdapter";

interface LessonSidebarProps {
  trail: Trail;
  modules: Module[];
  currentLesson: Lesson;
  allLessons: Lesson[];
  progress?: number;
  onLessonClick?: () => void;
  allowLockedNavigation?: boolean;
}

type LessonType = NonNullable<Lesson["type"]>;

const DEFAULT_LESSON_TYPE: LessonType = "reading";

const lessonTypeIcons: Record<LessonType, React.ComponentType<{ className?: string }>> = {
  video: Play,
  reading: FileText,
  quiz: HelpCircle,
  project: FolderKanban,
  discussion: MessageCircle,
};

const lessonTypeLabels: Record<LessonType, string> = {
  video: "Vídeo",
  reading: "Leitura",
  quiz: "Quiz",
  project: "Projeto",
  discussion: "Discussão",
};

function resolveLessonType(type?: Lesson["type"]): LessonType {
  return type ?? DEFAULT_LESSON_TYPE;
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
  },
  in_progress: {
    icon: Circle,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  available: {
    icon: Circle,
    color: "text-muted-foreground",
    bg: "",
  },
  locked: {
    icon: Lock,
    color: "text-muted-foreground/50",
    bg: "",
  },
};

export const LessonSidebar = ({
  trail,
  modules,
  currentLesson,
  allLessons,
  progress = 0,
  onLessonClick,
  allowLockedNavigation = false,
}: LessonSidebarProps) => {
  const navigate = useNavigate();

  // Find which module the current lesson belongs to
  const currentModuleId = currentLesson.moduleId;

  // Get lessons for a module
  const getLessonsForModule = (moduleId: string) => {
    return allLessons.filter((l) => l.moduleId === moduleId);
  };

  // Calculate module completion
  const getModuleProgress = (moduleId: string) => {
    const moduleLessons = getLessonsForModule(moduleId);
    if (moduleLessons.length === 0) return 0;
    const completed = moduleLessons.filter((l) => l.status === "completed").length;
    return Math.round((completed / moduleLessons.length) * 100);
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.status === "locked" && !allowLockedNavigation) return;
    navigate(`/trails/${trail.id}/lesson/${lesson.id}`);
    onLessonClick?.();
  };

  const totalLessons = allLessons.length || trail.totalLessons;
  const currentLessonIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const lessonPosition = currentLessonIndex >= 0 ? currentLessonIndex + 1 : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold text-sm text-foreground line-clamp-2 min-w-0 flex-1">
            {trail.title}
          </h2>
          {lessonPosition != null && totalLessons > 0 && (
            <Badge
              variant="outline"
              className="shrink-0 text-[10px] px-1.5 py-0 h-5 font-normal whitespace-nowrap"
            >
              Aula {lessonPosition} de {totalLessons}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {trail.totalModules} módulos • {trail.totalLessons} aulas
        </p>
        <div className="mt-3">
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground mt-1.5">
            {progress}% concluído
          </p>
        </div>
      </div>

      {/* Modules List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <Accordion
          type="single"
          collapsible
          defaultValue={currentModuleId}
          className="w-full"
        >
          {modules.map((module, moduleIndex) => {
            const moduleLessons = getLessonsForModule(module.id);
            const progress = getModuleProgress(module.id);
            const isCurrentModule = module.id === currentModuleId;
            const isLocked = module.status === "locked";

            return (
              <AccordionItem
                key={module.id}
                value={module.id}
                className="border-b border-border"
              >
                <AccordionTrigger
                  className={cn(
                    "px-4 py-3 hover:no-underline hover:bg-muted/50",
                    isCurrentModule && "bg-muted/30",
                    isLocked && "opacity-50"
                  )}
                  disabled={isLocked}
                >
                  <div className="flex items-start gap-3 text-left w-full">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-medium",
                        module.status === "completed"
                          ? "bg-success text-success-foreground"
                          : module.status === "in_progress"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {module.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isLocked ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        moduleIndex + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">
                        {module.title}
                      </p>
                      {!isLocked && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {progress}% concluído • {moduleLessons.length} aulas
                        </p>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <div className="space-y-0.5 pb-2">
                    {moduleLessons.map((lesson, lessonIndex) => {
                      const TypeIcon = lessonTypeIcons[resolveLessonType(lesson.type)];
                      const status = statusConfig[lesson.status];
                      const StatusIcon = status.icon;
                      const isCurrent = lesson.id === currentLesson.id;
                      const isLessonLocked = lesson.status === "locked" && !allowLockedNavigation;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson)}
                          disabled={isLessonLocked}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                            "hover:bg-muted/50",
                            isCurrent && "bg-primary/10 border-l-2 border-primary",
                            isLessonLocked && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {/* Status icon */}
                          <StatusIcon
                            className={cn("w-4 h-4 shrink-0", status.color)}
                          />

                          {/* Lesson info */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm line-clamp-2",
                                isCurrent ? "font-medium text-primary" : "text-foreground"
                              )}
                            >
                              {lessonIndex + 1}. {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <TypeIcon className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {lessonTypeLabels[resolveLessonType(lesson.type)]} • {lesson.duration} min
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};
