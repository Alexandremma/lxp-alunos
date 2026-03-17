import { Trophy, Zap, Crown, Gem, Star } from "lucide-react";
import { Evidence } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface PortfolioStatsProps {
  evidences: Evidence[];
}

export const PortfolioStats = ({ evidences }: PortfolioStatsProps) => {
  const totalXp = evidences.reduce((acc, e) => acc + (e.xpReward || 0), 0);
  
  const rarityCounts = {
    legendary: evidences.filter(e => e.rarity === 'legendary').length,
    epic: evidences.filter(e => e.rarity === 'epic').length,
    rare: evidences.filter(e => e.rarity === 'rare').length,
    uncommon: evidences.filter(e => e.rarity === 'uncommon').length,
    common: evidences.filter(e => e.rarity === 'common' || !e.rarity).length,
  };

  const stats = [
    {
      icon: Trophy,
      label: "Conquistas",
      value: evidences.length,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Zap,
      label: "XP Total",
      value: totalXp.toLocaleString('pt-BR'),
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      icon: Crown,
      label: "Lendários",
      value: rarityCounts.legendary,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      icon: Gem,
      label: "Épicos",
      value: rarityCounts.epic,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Star,
      label: "Raros",
      value: rarityCounts.rare,
      color: "text-info",
      bg: "bg-info/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "flex items-center gap-3 p-4 rounded-xl border border-border/50",
            "bg-card/50 backdrop-blur-sm"
          )}
        >
          <div className={cn("p-2.5 rounded-lg", stat.bg)}>
            <stat.icon className={cn("w-5 h-5", stat.color)} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
