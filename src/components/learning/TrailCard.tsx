import { Link } from "react-router-dom";
import { Clock, BookOpen, Trophy, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trail, getTrailProgress } from "@/data/mockData";

interface TrailCardProps {
  trail: Trail;
  className?: string;
}

const statusConfig = {
  not_started: {
    label: "Não iniciado",
    variant: "secondary" as const,
    className: "",
  },
  in_progress: {
    label: "Em andamento",
    variant: "default" as const,
    className: "",
  },
  completed: {
    label: "Concluído",
    variant: "outline" as const,
    className: "border-success text-success",
  },
};

export const TrailCard = ({ trail, className }: TrailCardProps) => {
  const progress = getTrailProgress(trail);
  const status = statusConfig[trail.status];

  return (
    <Link to={`/trails/${trail.id}`}>
      <Card
        className={cn(
          "group overflow-hidden card-hover cursor-pointer",
          "animate-fade-up",
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={trail.thumbnail}
            alt={trail.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
          
          {/* Category Badge */}
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 bg-card/80 backdrop-blur-sm"
          >
            {trail.category}
          </Badge>

          {/* Status Badge */}
          <Badge
            variant={status.variant}
            className={cn(
              "absolute top-3 right-3",
              status.className
            )}
          >
            {trail.status === "completed" && <Trophy className="w-3 h-3 mr-1" />}
            {status.label}
          </Badge>

          {/* XP Reward */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs font-medium text-primary bg-card/80 backdrop-blur-sm px-2 py-1 rounded-full">
            <span>+{trail.xpReward} XP</span>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title & Description */}
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {trail.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {trail.description}
            </p>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{trail.totalLessons} aulas</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{trail.estimatedHours}h</span>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {trail.completedLessons}/{trail.totalLessons} aulas
              </span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">
              {trail.instructor}
            </span>
            <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
              <span>
                {trail.status === "not_started" ? "Começar" : 
                 trail.status === "completed" ? "Revisar" : "Continuar"}
              </span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
