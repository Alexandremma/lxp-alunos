import { LucideIcon, BookOpen, Trophy, FolderKanban, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyLearningProps {
  type: "trails" | "lessons" | "portfolio" | "progress";
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const emptyConfig = {
  trails: {
    icon: BookOpen,
    defaultTitle: "Nenhuma trilha encontrada",
    defaultDescription: "Você ainda não iniciou nenhuma trilha de aprendizagem. Explore nosso catálogo e comece sua jornada!",
    illustration: "📚",
  },
  lessons: {
    icon: Target,
    defaultTitle: "Nenhuma aula disponível",
    defaultDescription: "As aulas desta trilha ainda não foram liberadas. Volte em breve para novidades!",
    illustration: "🎯",
  },
  portfolio: {
    icon: FolderKanban,
    defaultTitle: "Seu portfólio está vazio",
    defaultDescription: "Complete trilhas e projetos para adicionar evidências ao seu portfólio. Suas conquistas aparecerão aqui!",
    illustration: "🏆",
  },
  progress: {
    icon: Trophy,
    defaultTitle: "Sem dados de progresso",
    defaultDescription: "Comece a estudar para visualizar seu progresso e estatísticas de aprendizagem.",
    illustration: "📊",
  },
};

export const EmptyLearning = ({
  type,
  title,
  description,
  action,
  className,
}: EmptyLearningProps) => {
  const config = emptyConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-up",
        className
      )}
    >
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="text-7xl mb-2">{config.illustration}</div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-muted rounded-full blur-sm" />
      </div>

      {/* Icon badge */}
      <div className="rounded-full bg-muted p-3 mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description || config.defaultDescription}
      </p>

      {/* Action */}
      {action && (
        <Button onClick={action.onClick} className="glow-sm">
          {action.label}
        </Button>
      )}
    </div>
  );
};
