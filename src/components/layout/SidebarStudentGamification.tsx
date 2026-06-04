import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Flame, Star, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/use-auth"
import { useDashboardStats } from "@/hooks/queries/useDashboardStats"
import type { DashboardStats } from "@/services/dashboardService"

const EMPTY_STATS: DashboardStats = {
  streak: 0,
  level: 1,
  levelTitle: "Iniciante",
  totalXp: 0,
  levelProgressPercent: 0,
  xpToNextLevel: 100,
  completedTrails: 0,
  totalLessonsCompleted: 0,
  totalHoursStudied: 0,
}

function formatXp(value: number): string {
  return value.toLocaleString("pt-BR")
}

interface SidebarStudentGamificationProps {
  collapsed?: boolean
}

export function SidebarStudentGamification({
  collapsed = false,
}: SidebarStudentGamificationProps) {
  const { profile } = useAuth()
  const { data, isLoading, isError } = useDashboardStats(profile?.id)

  const displayName = useMemo(() => {
    const candidate = (profile?.name ?? "").trim()
    if (!candidate) return "Aluno"
    return candidate.split(/\s+/)[0] ?? candidate
  }, [profile?.name])

  if (!profile?.id) return null

  const stats = data ?? (isError ? EMPTY_STATS : null)

  const cardSurface = cn(
    "rounded-lg border border-sidebar-border transition-colors",
    "bg-sidebar-accent/20 hover:bg-sidebar-accent/60",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
  )

  if (collapsed) {
    const level = stats?.level ?? 1
    const totalXp = stats?.totalXp ?? 0
    const levelTitle = stats?.levelTitle ?? "—"

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/progress"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar transition-colors",
              "hover:bg-sidebar-accent",
              isLoading && "pointer-events-none",
            )}
            aria-label={`${displayName}, nível ${level}, ${formatXp(totalXp)} XP`}
          >
            {isLoading ? (
              <Skeleton className="h-7 w-7 rounded-md" />
            ) : (
              <span className="flex flex-col items-center text-sidebar-foreground">
                <Star className="h-3 w-3 text-sidebar-foreground/70" aria-hidden />
                <span className="text-[10px] font-bold leading-none">{level}</span>
              </span>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[220px]">
          <p className="font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">
            Nível {level} · {levelTitle}
          </p>
          <p className="text-xs text-muted-foreground">{formatXp(totalXp)} XP</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  if (isLoading) {
    return (
      <div className={cn(cardSurface, "p-2.5 space-y-1.5 w-full")}>
        <Skeleton className="h-3 w-full bg-sidebar-border" />
        <Skeleton className="h-3 w-2/3 bg-sidebar-border" />
        <Skeleton className="h-1 w-full bg-sidebar-border" />
      </div>
    )
  }

  const s = stats ?? EMPTY_STATS

  return (
    <Link to="/progress" className={cn(cardSurface, "block w-full p-2.5")}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-sidebar-foreground">
          <span className="inline-flex shrink-0 items-center gap-1 rounded border border-sidebar-border bg-sidebar-accent/40 px-1 py-0.5 font-semibold tabular-nums">
            <Star className="h-2.5 w-2.5" aria-hidden />
            {s.level}
          </span>
          <span className="truncate text-sm font-medium">{s.levelTitle}</span>
        </div>
        {s.streak > 0 ? (
          <span
            className="inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-sidebar-foreground/70"
            title="Dias seguidos de acesso"
          >
            <Flame className="h-4 w-4 text-destructive/90" aria-hidden />
            {s.streak}
          </span>
        ) : null}
      </div>

      <p className="mt-2 flex items-center gap-1 text-xs font-semibold tabular-nums text-sidebar-foreground">
        <Zap className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/60" aria-hidden />
        {formatXp(s.totalXp)} XP
      </p>

      <Progress
        value={s.levelProgressPercent}
        className="mt-2 h-1 bg-sidebar-border [&>div]:bg-primary/80"
        aria-label="Progresso até o próximo nível"
      />

      <p className="mt-1.5 text-[11px] leading-tight text-sidebar-foreground/50">
        {s.xpToNextLevel != null
          ? `+${formatXp(s.xpToNextLevel)} XP p/ próx. nível`
          : "Nível máximo"}
      </p>
    </Link>
  )
}
