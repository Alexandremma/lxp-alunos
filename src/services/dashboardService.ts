import { supabase } from "@/lib/supabaseClient";
import { computeConsecutiveLoginStreak } from "@/lib/accessDate";
import { listStudentAccessDates } from "@/services/studentAccessService";
import { getEnrolledLinkedDisciplinesCatalog } from "@/services/libraryAdapter";
import type { DashboardStats } from "@/types/dashboard";
import type { SearchLibraryResponse } from "@/types/library";

export type { DashboardStats } from "@/types/dashboard";

type LevelRow = {
  level_number: number;
  title: string;
  min_total_xp: number;
};

function resolveLevel(totalXp: number, levels: LevelRow[]): { level: number; title: string } {
  if (!levels.length) {
    return { level: Math.max(1, Math.floor(totalXp / 100) + 1), title: "Aprendiz" };
  }
  const sorted = [...levels].sort((a, b) => b.min_total_xp - a.min_total_xp);
  for (const row of sorted) {
    if (totalXp >= row.min_total_xp) {
      return { level: row.level_number, title: row.title };
    }
  }
  const first = [...levels].sort((a, b) => a.level_number - b.level_number)[0];
  return { level: first?.level_number ?? 1, title: first?.title ?? "Iniciante" };
}

function resolveLevelProgress(
  totalXp: number,
  levels: LevelRow[],
  level: number,
): Pick<DashboardStats, "levelProgressPercent" | "xpToNextLevel"> {
  if (!levels.length) {
    const floor = Math.max(0, Math.floor(totalXp / 100) * 100);
    const ceiling = floor + 100;
    const span = ceiling - floor;
    return {
      levelProgressPercent: span > 0 ? Math.min(100, ((totalXp - floor) / span) * 100) : 0,
      xpToNextLevel: Math.max(0, ceiling - totalXp),
    };
  }

  const sorted = [...levels].sort((a, b) => a.min_total_xp - b.min_total_xp);
  const idx = Math.max(0, sorted.findIndex((row) => row.level_number === level));
  const currentMin = sorted[idx]?.min_total_xp ?? 0;
  const next = sorted[idx + 1];

  if (!next) {
    return { levelProgressPercent: 100, xpToNextLevel: null };
  }

  const span = next.min_total_xp - currentMin;
  const progress = span > 0 ? ((totalXp - currentMin) / span) * 100 : 0;

  return {
    levelProgressPercent: Math.min(100, Math.max(0, progress)),
    xpToNextLevel: Math.max(0, next.min_total_xp - totalXp),
  };
}

export async function getDashboardStats(profileId: string): Promise<DashboardStats> {
  const [
    xpRowsResult,
    levelsResult,
    lessonsCountResult,
    accessDatesResult,
    catalogResult,
  ] = await Promise.all([
    supabase.from("lxp_student_xp_events").select("xp_delta").eq("student_profile_id", profileId),
    supabase
      .from("lxp_gamification_levels")
      .select("level_number,title,min_total_xp")
      .eq("is_active", true)
      .order("min_total_xp", { ascending: true }),
    supabase
      .from("lxp_student_lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("student_profile_id", profileId)
      .eq("status", "completed"),
    listStudentAccessDates(profileId).catch(() => [] as string[]),
    getEnrolledLinkedDisciplinesCatalog(profileId).catch((): SearchLibraryResponse => ({ items: [], total: 0 })),
  ]);

  if (levelsResult.error) throw levelsResult.error;
  if (lessonsCountResult.error) throw lessonsCountResult.error;

  const accessDates = accessDatesResult;

  let totalXp = 0;
  if (xpRowsResult.error) {
    const { data: legacyRows, error: legErr } = await supabase
      .from("lxp_student_discipline_progress")
      .select("xp_earned")
      .eq("student_profile_id", profileId);
    if (legErr) throw legErr;
    totalXp = (legacyRows ?? []).reduce((s, r) => s + ((r as { xp_earned: number | null }).xp_earned ?? 0), 0);
  } else {
    totalXp = (xpRowsResult.data ?? []).reduce((s, r) => s + ((r as { xp_delta: number }).xp_delta ?? 0), 0);
  }

  const levels = (levelsResult.data ?? []) as LevelRow[];
  const { level, title: levelTitle } = resolveLevel(totalXp, levels);
  const { levelProgressPercent, xpToNextLevel } = resolveLevelProgress(totalXp, levels, level);

  const completedTrails = (catalogResult.items ?? []).filter((item) => item.isComplete).length;
  const totalLessonsCompleted = lessonsCountResult.count ?? 0;
  const totalHoursStudied = Number((totalLessonsCompleted * 0.5).toFixed(1));
  const streak = computeConsecutiveLoginStreak(accessDates);

  return {
    streak,
    level,
    levelTitle,
    totalXp,
    levelProgressPercent,
    xpToNextLevel,
    completedTrails,
    totalLessonsCompleted,
    totalHoursStudied,
  };
}
