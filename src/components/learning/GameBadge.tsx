import { 
  Trophy, Flame, Star, Medal, Award, Zap, Target, BookOpen, 
  Users, Calendar, Clock, Sparkles, Crown, Gem, Shield,
  GraduationCap, Rocket, Heart, LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LearningEvidence } from "@/types/learningEvidence";

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

const iconMap: Record<string, LucideIcon> = {
  trophy: Trophy,
  flame: Flame,
  star: Star,
  medal: Medal,
  award: Award,
  zap: Zap,
  target: Target,
  book: BookOpen,
  users: Users,
  calendar: Calendar,
  clock: Clock,
  sparkles: Sparkles,
  crown: Crown,
  gem: Gem,
  shield: Shield,
  graduation: GraduationCap,
  rocket: Rocket,
  heart: Heart,
};

const rarityConfig: Record<Rarity, {
  label: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  iconBg: string;
  textColor: string;
  animate?: string;
}> = {
  common: {
    label: 'Comum',
    bgGradient: 'bg-gradient-to-br from-muted/50 to-muted',
    borderColor: 'border-muted-foreground/20',
    glowColor: '',
    iconBg: 'bg-muted-foreground/20',
    textColor: 'text-muted-foreground',
  },
  uncommon: {
    label: 'Incomum',
    bgGradient: 'bg-gradient-to-br from-success/10 to-success/20',
    borderColor: 'border-success/30',
    glowColor: 'shadow-[0_0_20px_hsl(142_76%_36%/0.2)]',
    iconBg: 'bg-success/20',
    textColor: 'text-success',
  },
  rare: {
    label: 'Raro',
    bgGradient: 'bg-gradient-to-br from-info/10 to-info/20',
    borderColor: 'border-info/30',
    glowColor: 'shadow-[0_0_25px_hsl(199_89%_48%/0.25)]',
    iconBg: 'bg-info/20',
    textColor: 'text-info',
  },
  epic: {
    label: 'Épico',
    bgGradient: 'bg-gradient-to-br from-primary/10 to-primary/25',
    borderColor: 'border-primary/40',
    glowColor: 'shadow-[0_0_30px_hsl(262_83%_58%/0.3)]',
    iconBg: 'bg-primary/20',
    textColor: 'text-primary',
    animate: 'animate-pulse-glow',
  },
  legendary: {
    label: 'Lendário',
    bgGradient: 'bg-gradient-to-br from-warning/15 to-warning/30',
    borderColor: 'border-warning/50',
    glowColor: 'shadow-[0_0_40px_hsl(38_92%_50%/0.4)]',
    iconBg: 'bg-warning/25',
    textColor: 'text-warning',
    animate: 'animate-pulse-glow',
  },
};

interface GameBadgeProps {
  evidence: LearningEvidence;
  className?: string;
}

export const GameBadge = ({ evidence, className }: GameBadgeProps) => {
  const rarity = evidence.rarity || 'common';
  const config = rarityConfig[rarity];
  const IconComponent = iconMap[evidence.icon || 'star'] || Star;

  return (
    <div
      className={cn(
        "group relative rounded-2xl border-2 p-5 h-[260px] transition-all duration-300",
        "hover:scale-105 hover:-translate-y-1",
        config.bgGradient,
        config.borderColor,
        config.glowColor,
        config.animate,
        className
      )}
    >
      {/* Content Container */}
      <div className="flex flex-col items-center h-full">
        {/* Icon Container */}
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300",
          "group-hover:rotate-6",
          config.iconBg
        )}>
          <IconComponent className={cn("w-7 h-7", config.textColor)} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h3 className="text-center font-semibold text-foreground text-sm line-clamp-2 h-10 mt-3">
          {evidence.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground text-center line-clamp-2 h-8 mt-1">
          {evidence.description}
        </p>

        {/* XP + Date - always at bottom */}
        <div className="mt-auto flex flex-col items-center gap-1.5">
          {evidence.xpReward && (
            <div className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
              config.iconBg,
              config.textColor
            )}>
              <Zap className="w-3.5 h-3.5" />
              +{evidence.xpReward} XP
            </div>
          )}

          <p className="text-[10px] text-muted-foreground/60">
            {new Date(evidence.earnedAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
