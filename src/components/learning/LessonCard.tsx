import { Link } from "react-router-dom";
import { 
  PlayCircle, 
  FileText, 
  HelpCircle, 
  FolderKanban,
  MessageSquare,
  Clock,
  CheckCircle2,
  Lock,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Lesson } from "@/data/mockData";

interface LessonCardProps {
  lesson: Lesson;
  trailId: string;
  className?: string;
}

const typeConfig = {
  video: {
    icon: PlayCircle,
    label: "Vídeo",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  reading: {
    icon: FileText,
    label: "Leitura",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  quiz: {
    icon: HelpCircle,
    label: "Quiz",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  project: {
    icon: FolderKanban,
    label: "Projeto",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  discussion: {
    icon: MessageSquare,
    label: "Discussão",
    color: "text-success",
    bgColor: "bg-success/10",
  },
};

const statusConfig = {
  locked: {
    icon: Lock,
    label: "Bloqueado",
    className: "opacity-50 cursor-not-allowed",
  },
  available: {
    icon: null,
    label: "Disponível",
    className: "cursor-pointer hover:bg-muted/50",
  },
  in_progress: {
    icon: null,
    label: "Em andamento",
    className: "cursor-pointer hover:bg-muted/50 border-l-2 border-l-primary",
  },
  completed: {
    icon: CheckCircle2,
    label: "Concluído",
    className: "cursor-pointer hover:bg-muted/50",
  },
};

export const LessonCard = ({ lesson, trailId, className }: LessonCardProps) => {
  const typeInfo = typeConfig[lesson.type];
  const statusInfo = statusConfig[lesson.status];
  const TypeIcon = typeInfo.icon;
  const StatusIcon = statusInfo.icon;

  const content = (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg transition-all",
        "bg-card border border-border",
        statusInfo.className,
        className
      )}
    >
      {/* Type Icon */}
      <div className={cn("p-2.5 rounded-lg", typeInfo.bgColor)}>
        <TypeIcon className={cn("w-5 h-5", typeInfo.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-base font-semibold text-foreground truncate">
            {lesson.title}
          </h4>
          {lesson.status === "completed" && StatusIcon && (
            <StatusIcon className="w-4 h-4 text-success flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className={typeInfo.color}>{typeInfo.label}</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{lesson.duration} min</span>
          </div>
          <span className="text-primary">+{lesson.xpReward} XP</span>
        </div>
      </div>

      {/* Status / Action */}
      <div className="flex-shrink-0">
        {lesson.status === "locked" ? (
          <Lock className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </div>
    </div>
  );

  if (lesson.status === "locked") {
    return content;
  }

  return (
    <Link to={`/trails/${trailId}/lesson/${lesson.id}`} className="group block">
      {content}
    </Link>
  );
};
