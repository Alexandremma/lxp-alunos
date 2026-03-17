import { cn } from "@/lib/utils";
import { Trophy, Star, Flame, Medal, Award, Zap } from "lucide-react";

type BadgeType = "achievement" | "streak" | "level" | "completion" | "excellence" | "xp";

interface FeedbackBadgeProps {
  type: BadgeType;
  value?: string | number;
  label: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

const badgeConfig = {
  achievement: {
    icon: Trophy,
    gradient: "from-warning to-warning/70",
    bgColor: "bg-warning/10",
    textColor: "text-warning",
  },
  streak: {
    icon: Flame,
    gradient: "from-destructive to-warning",
    bgColor: "bg-destructive/10",
    textColor: "text-destructive",
  },
  level: {
    icon: Star,
    gradient: "from-primary to-secondary",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
  },
  completion: {
    icon: Medal,
    gradient: "from-success to-success/70",
    bgColor: "bg-success/10",
    textColor: "text-success",
  },
  excellence: {
    icon: Award,
    gradient: "from-secondary to-primary",
    bgColor: "bg-secondary/10",
    textColor: "text-secondary",
  },
  xp: {
    icon: Zap,
    gradient: "from-primary to-primary/70",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
  },
};

const sizeConfig = {
  sm: {
    container: "p-2",
    icon: "w-4 h-4",
    value: "text-sm",
    label: "text-xs",
  },
  md: {
    container: "p-3",
    icon: "w-5 h-5",
    value: "text-base",
    label: "text-xs",
  },
  lg: {
    container: "p-4",
    icon: "w-6 h-6",
    value: "text-lg",
    label: "text-sm",
  },
};

export const FeedbackBadge = ({
  type,
  value,
  label,
  size = "md",
  animated = false,
  className,
}: FeedbackBadgeProps) => {
  const config = badgeConfig[type];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border",
        config.bgColor,
        sizeStyles.container,
        animated && "animate-scale-in",
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "rounded-full p-1.5 bg-gradient-to-br",
          config.gradient
        )}
      >
        <Icon className={cn(sizeStyles.icon, "text-white")} />
      </div>

      {/* Content */}
      <div className="flex flex-col">
        {value !== undefined && (
          <span className={cn("font-bold leading-none", sizeStyles.value, config.textColor)}>
            {value}
          </span>
        )}
        <span className={cn("text-muted-foreground", sizeStyles.label)}>
          {label}
        </span>
      </div>
    </div>
  );
};
