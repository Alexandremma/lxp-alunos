import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, Clock, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModeratorDisciplineCatalogItem } from "@/types/moderatorCatalog";
import {
  disciplineCategoryConfig,
} from "@/components/learning/DisciplineCatalogCard";

const COVER_IMAGE_HEIGHT = "h-48";

type ModeratorDisciplineCatalogCardProps = {
  item: ModeratorDisciplineCatalogItem;
  onOpenDiscipline: (id: string) => void;
};

export function ModeratorDisciplineCatalogCard({
  item,
  onOpenDiscipline,
}: ModeratorDisciplineCatalogCardProps) {
  const category = disciplineCategoryConfig[item.courseCategory];
  const CategoryIcon = category.icon;

  return (
    <Card className="overflow-hidden flex flex-col h-full border-border/80 hover:border-primary/40 transition-colors">
      <div
        className={cn(
          "relative w-full bg-gradient-to-br from-primary/20 via-background to-secondary/20",
          COVER_IMAGE_HEIGHT,
        )}
      >
        {item.coverImageUrl ? (
          <img
            src={item.coverImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-black/65 px-2.5 py-1 text-xs font-medium text-white/95 backdrop-blur-md">
            <CategoryIcon className={cn("h-3.5 w-3.5", category.iconClass)} />
            {category.label}
          </span>
        </div>
      </div>

      <CardHeader className="pb-2">
        <p className="text-xs text-muted-foreground truncate">{item.courseName}</p>
        <CardTitle className="text-lg leading-snug line-clamp-2">{item.name}</CardTitle>
        {item.code ? (
          <p className="text-xs text-muted-foreground font-mono">{item.code}</p>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-col flex-1 pt-0">
        <div className="space-y-1 text-xs text-muted-foreground mb-4">
          {item.professor ? (
            <p className="flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.professor}</span>
            </p>
          ) : null}
          {item.workloadHours ? (
            <p className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {item.workloadHours}h
            </p>
          ) : null}
        </div>

        <Button
          className="w-full mt-auto gap-2"
          onClick={() => onOpenDiscipline(item.id)}
        >
          <BookOpen className="h-4 w-4" />
          Abrir disciplina
          <ChevronRight className="h-4 w-4 ml-auto" />
        </Button>
      </CardContent>
    </Card>
  );
}
