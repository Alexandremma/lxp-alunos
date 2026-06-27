import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LearningProgressBar } from "@/components/learning/LearningProgressBar";
import { clampProgressPercent } from "@/lib/progressPercent";
import {
  BookMarked,
  BookOpen,
  ChevronRight,
  Clock,
  GraduationCap,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CourseCategory,
  DisciplineProgressStatus,
  StudentDisciplineCatalogItem,
} from "@/types/studentCatalog";

const COVER_IMAGE_HEIGHT = "h-48";

const overlayBadgeBase =
  "inline-flex items-center gap-1 rounded-md border border-white/20 bg-black/65 px-2.5 py-1 text-xs font-medium text-white/95 shadow-sm shadow-black/30 backdrop-blur-md";

export const disciplineCategoryConfig: Record<
  CourseCategory,
  { label: string; icon: typeof GraduationCap; iconClass: string }
> = {
  graduation: {
    label: "Graduação",
    icon: GraduationCap,
    iconClass: "text-cyan-400",
  },
  postgraduate: {
    label: "Pós-Graduação",
    icon: GraduationCap,
    iconClass: "text-sky-400",
  },
  extension: {
    label: "Extensão",
    icon: BookMarked,
    iconClass: "text-violet-400",
  },
  free_course: {
    label: "Curso livre",
    icon: BookOpen,
    iconClass: "text-amber-400",
  },
};

export const disciplineStatusConfig: Record<
  DisciplineProgressStatus,
  { label: string; accentClass: string }
> = {
  available: {
    label: "Disponível",
    accentClass: "border-l-neutral-400",
  },
  enrolled: {
    label: "Cursando",
    accentClass: "border-l-cyan-400",
  },
  completed: {
    label: "Concluído",
    accentClass: "border-l-emerald-400",
  },
  discipline_inactive: {
    label: "Disciplina inativa",
    accentClass: "border-l-amber-400",
  },
  enrollment_inactive: {
    label: "Matrícula inativa",
    accentClass: "border-l-red-400",
  },
};

type DisciplineCatalogCardProps = {
  item: StudentDisciplineCatalogItem;
  onOpenDiscipline: (id: string) => void;
  onEnroll?: (id: string) => void;
  compactAction?: boolean;
};

export function DisciplineCatalogCard({
  item,
  onOpenDiscipline,
  onEnroll,
  compactAction = false,
}: DisciplineCatalogCardProps) {
  const category = disciplineCategoryConfig[item.courseCategory];
  const CategoryIcon = category.icon;
  const status = disciplineStatusConfig[item.progressStatus];
  const showProgress =
    item.progressStatus === "enrolled" ||
    item.progressStatus === "completed" ||
    item.progressStatus === "discipline_inactive" ||
    item.progressStatus === "enrollment_inactive";

  const isBlocked =
    item.progressStatus === "discipline_inactive" ||
    item.progressStatus === "enrollment_inactive";

  const progress = clampProgressPercent(item.progressPercent ?? 0);

  return (
    <Card className="overflow-hidden card-hover group flex h-full flex-col">
      <div
        className={cn(
          "relative bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center overflow-hidden",
          COVER_IMAGE_HEIGHT,
        )}
      >
        {item.coverImageUrl ? (
          <>
            <img
              src={item.coverImageUrl}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 top-0 z-[1] h-[55%] bg-gradient-to-b from-black/75 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/15 to-transparent pointer-events-none" />
          </>
        ) : (
          <CategoryIcon className="h-12 w-12 text-primary/40" />
        )}
        <div className="absolute top-3 left-3 z-10 max-w-[calc(100%-8.5rem)] min-w-0">
          <span className={cn(overlayBadgeBase, "max-w-full")}>
            <CategoryIcon className={cn("h-3 w-3 shrink-0", category.iconClass)} />
            <span className="truncate">{category.label}</span>
          </span>
        </div>
        <div className="absolute top-3 right-3 z-10 shrink-0">
          <span className={cn(overlayBadgeBase, "shrink-0 border-l-[3px]", status.accentClass)}>
            {status.label}
          </span>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
        <p className="text-xs text-muted-foreground line-clamp-1">{item.courseName}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {(item.workloadHours ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 shrink-0" />
              {item.workloadHours}h
            </span>
          )}
          {(item.credits ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 shrink-0" />
              {item.credits} créditos
            </span>
          )}
          {item.professor && item.professor !== "—" && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4 shrink-0" />
              {item.professor}
            </span>
          )}
        </div>

        <div className="mt-auto space-y-4 pt-4">
          {showProgress && <LearningProgressBar value={progress} />}

          <Button
            className="w-full"
            variant={
              compactAction || item.progressStatus === "enrolled"
                ? "secondary"
                : item.canSelfEnroll
                  ? "default"
                  : "outline"
            }
            disabled={isBlocked}
            onClick={() => {
              if (item.canSelfEnroll && onEnroll) {
                onEnroll(item.id);
                return;
              }
              if (
                item.progressStatus === "enrolled" ||
                item.progressStatus === "completed"
              ) {
                onOpenDiscipline(item.id);
              }
            }}
          >
            {item.progressStatus === "discipline_inactive" && "Disciplina inativa"}
            {item.progressStatus === "enrollment_inactive" && "Matrícula inativa"}
            {!compactAction && item.canSelfEnroll && "Inscrever-se"}
            {item.progressStatus === "enrolled" && (
              <>
                {progress > 0 ? "Continuar" : "Iniciar"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
            {item.progressStatus === "completed" && "Concluído"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
