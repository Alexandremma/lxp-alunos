import { supabase } from "@/lib/supabaseClient";
import { computeConsecutiveLoginStreak } from "@/lib/accessDate";
import { listStudentAccessDates } from "@/services/studentAccessService";

export type DashboardStats = {
  streak: number;
  level: number;
  levelTitle: string;
  totalXp: number;
  completedTrails: number;
  totalLessonsCompleted: number;
  totalHoursStudied: number;
};

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

export async function getDashboardStats(profileId: string): Promise<DashboardStats> {
  const [
    xpRowsResult,
    levelsResult,
    disciplineProgressResult,
    lessonsCountResult,
    accessDatesResult,
  ] = await Promise.all([
    supabase.from("lxp_student_xp_events").select("xp_delta").eq("student_profile_id", profileId),
    supabase
      .from("lxp_gamification_levels")
      .select("level_number,title,min_total_xp")
      .eq("is_active", true)
      .order("min_total_xp", { ascending: true }),
    supabase.from("lxp_student_discipline_progress").select("status").eq("student_profile_id", profileId),
    supabase
      .from("lxp_student_lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("student_profile_id", profileId)
      .eq("status", "completed"),
    listStudentAccessDates(profileId).catch(() => [] as string[]),
  ]);

  if (levelsResult.error) throw levelsResult.error;
  if (disciplineProgressResult.error) throw disciplineProgressResult.error;
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

  const progressRows = disciplineProgressResult.data ?? [];
  const completedTrails = progressRows.filter((row) => (row as { status: string }).status === "approved").length;
  const totalLessonsCompleted = lessonsCountResult.count ?? 0;
  const totalHoursStudied = Number((totalLessonsCompleted * 0.5).toFixed(1));
  const streak = computeConsecutiveLoginStreak(accessDates);

  return {
    streak,
    level,
    levelTitle,
    totalXp,
    completedTrails,
    totalLessonsCompleted,
    totalHoursStudied,
  };
}
