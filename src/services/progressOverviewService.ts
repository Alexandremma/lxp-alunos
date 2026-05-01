import { getDashboardStats, type DashboardStats } from "@/services/dashboardService";
import { getEnrolledLinkedDisciplinesCatalog } from "@/services/libraryAdapter";
import { getTrailLessons, resolveExternalDisciplineId } from "@/services/trailAdapter";
import { supabase } from "@/lib/supabaseClient";

export type WeeklyStudyPoint = {
  day: string;
  completedLessons: number;
};

export type ProgressTrailSummary = {
  id: string;
  title: string;
  thumbnail: string;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
};

export type ProgressOverview = {
  stats: DashboardStats & { totalTrails: number };
  weeklyStudyData: WeeklyStudyPoint[];
  trails: ProgressTrailSummary[];
};

const WEEK_DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function buildWeeklyStudyData(
  lessonRows: Array<{ last_accessed_at: string | null; completed_at: string | null }>,
): WeeklyStudyPoint[] {
  const now = new Date();
  const dayLessons = new Array<number>(7).fill(0);

  for (let delta = 6; delta >= 0; delta -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - delta);
    const weekDay = d.getDay();
    dayLessons[weekDay] = 0;
  }

  for (const row of lessonRows) {
    const source = row.completed_at;
    if (!source) continue;
    const date = new Date(source);
    if (Number.isNaN(date.getTime())) continue;
    dayLessons[date.getDay()] += 1;
  }

  const data: WeeklyStudyPoint[] = [];
  for (let delta = 6; delta >= 0; delta -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - delta);
    const wd = d.getDay();
    data.push({ day: WEEK_DAYS_PT[wd], completedLessons: dayLessons[wd] });
  }

  return data;
}

export async function getProgressOverview(profileId: string): Promise<ProgressOverview> {
  const [{ stats }, catalogResult, lessonRowsResult] = await Promise.all([
    (async () => ({ stats: await getDashboardStats(profileId) }))(),
    getEnrolledLinkedDisciplinesCatalog(profileId),
    supabase
      .from("lxp_student_lesson_progress")
      .select("external_discipline_id,status,last_accessed_at,completed_at")
      .eq("student_profile_id", profileId),
  ]);

  if (lessonRowsResult.error) throw lessonRowsResult.error;
  const lessonRows = lessonRowsResult.data ?? [];
  const weeklyStudyData = buildWeeklyStudyData(lessonRows);

  const completedByExternal = new Map<string, number>();
  for (const row of lessonRows) {
    if (row.status !== "completed") continue;
    const key = row.external_discipline_id;
    completedByExternal.set(key, (completedByExternal.get(key) ?? 0) + 1);
  }

  const trails = (
    await Promise.all(
      (catalogResult.items ?? []).map(async (item) => {
        const lessons = await getTrailLessons(item.id);
        const externalId = await resolveExternalDisciplineId(item.id);
        const completedLessons = completedByExternal.get(externalId) ?? 0;
        const totalLessons = Math.max(lessons.length, completedLessons, 1);
        const progressPercent = Math.round((completedLessons / totalLessons) * 100);

        return {
          id: item.id,
          title: item.name,
          thumbnail: "/placeholder.svg",
          completedLessons,
          totalLessons,
          progressPercent,
        } satisfies ProgressTrailSummary;
      }),
    )
  ).sort((a, b) => b.progressPercent - a.progressPercent);

  return {
    stats: {
      ...stats,
      completedTrails: trails.filter((trail) => trail.progressPercent >= 100).length,
      totalTrails: trails.length,
    },
    weeklyStudyData,
    trails,
  };
}
