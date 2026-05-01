import { supabase } from "@/lib/supabaseClient";

export type DashboardStats = {
  streak: number;
  level: number;
  totalXp: number;
  completedTrails: number;
  totalLessonsCompleted: number;
  totalHoursStudied: number;
};

export async function getDashboardStats(profileId: string): Promise<DashboardStats> {
  const [
    { data: disciplineProgressRows, error: disciplineProgressError },
    lessonsCountResult,
    lessonDatesResult,
  ] =
    await Promise.all([
      supabase
        .from("lxp_student_discipline_progress")
        .select("status,xp_earned")
        .eq("student_profile_id", profileId),
      supabase
        .from("lxp_student_lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("student_profile_id", profileId)
        .eq("status", "completed"),
      supabase
        .from("lxp_student_lesson_progress")
        .select("completed_at")
        .eq("student_profile_id", profileId)
        .eq("status", "completed")
        .not("completed_at", "is", null),
    ]);

  if (disciplineProgressError) throw disciplineProgressError;
  if (lessonsCountResult.error) throw lessonsCountResult.error;
  if (lessonDatesResult.error) throw lessonDatesResult.error;

  const progressRows = disciplineProgressRows ?? [];
  const completedTrails = progressRows.filter((row) => row.status === "approved").length;
  const totalXp = progressRows.reduce((sum, row) => sum + (row.xp_earned ?? 0), 0);
  const totalLessonsCompleted = lessonsCountResult.count ?? 0;
  // Sem telemetria de tempo real por aula ainda; usa estimativa de 30min por aula concluida.
  const totalHoursStudied = Number((totalLessonsCompleted * 0.5).toFixed(1));
  const level = Math.max(1, Math.floor(totalXp / 100) + 1);
  const uniqueDays = new Set(
    (lessonDatesResult.data ?? [])
      .map((row) => row.completed_at as string | null)
      .filter(Boolean)
      .map((iso) => (iso as string).slice(0, 10)),
  );
  const streak = uniqueDays.size;

  return {
    streak,
    level,
    totalXp,
    completedTrails,
    totalLessonsCompleted,
    totalHoursStudied,
  };
}
