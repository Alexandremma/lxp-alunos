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
  const [{ data: disciplineProgressRows, error: disciplineProgressError }, lessonsCountResult] =
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
    ]);

  if (disciplineProgressError) throw disciplineProgressError;
  if (lessonsCountResult.error) throw lessonsCountResult.error;

  const progressRows = disciplineProgressRows ?? [];
  const completedTrails = progressRows.filter((row) => row.status === "approved").length;
  const totalXp = progressRows.reduce((sum, row) => sum + (row.xp_earned ?? 0), 0);
  const totalLessonsCompleted = lessonsCountResult.count ?? 0;
  // Sem telemetria de tempo real por aula ainda; usa estimativa de 30min por aula concluida.
  const totalHoursStudied = Number((totalLessonsCompleted * 0.5).toFixed(1));
  const level = Math.max(1, Math.floor(totalXp / 100) + 1);

  return {
    streak: 0,
    level,
    totalXp,
    completedTrails,
    totalLessonsCompleted,
    totalHoursStudied,
  };
}
