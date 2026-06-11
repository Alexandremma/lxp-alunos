import { supabase } from "@/lib/supabaseClient";
import { getDashboardStats, type DashboardStats } from "@/services/dashboardService";
import { getEnrolledLinkedDisciplinesCatalog } from "@/services/libraryAdapter";

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
  isComplete: boolean;
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

  const disciplineIds = (catalogResult.items ?? []).map((item) => item.id);
  let externalByDiscipline = new Map<string, string>();
  if (disciplineIds.length > 0) {
    const { data: linkRows, error: linksError } = await supabase
      .from("lxp_course_library_links")
      .select("course_discipline_id,library_content_id")
      .eq("library_content_type", "discipline")
      .in("course_discipline_id", disciplineIds);
    if (linksError) throw linksError;
    externalByDiscipline = new Map(
      (linkRows ?? []).map((row) => [
        row.course_discipline_id as string,
        String(row.library_content_id),
      ]),
    );
  }

  const lessonCountsByExternal = new Map<string, { completed: number; total: number }>();
  for (const row of lessonRows) {
    const externalId = row.external_discipline_id as string | null;
    if (!externalId) continue;
    const current = lessonCountsByExternal.get(externalId) ?? { completed: 0, total: 0 };
    current.total += 1;
    if (row.status === "completed") current.completed += 1;
    lessonCountsByExternal.set(externalId, current);
  }

  const trails = (catalogResult.items ?? [])
    .map((item) => {
      const externalId = externalByDiscipline.get(item.id);
      const lessonCounts = externalId ? lessonCountsByExternal.get(externalId) : undefined;
      const completedLessons = lessonCounts?.completed ?? 0;
      const totalLessons = lessonCounts?.total ?? 0;
      const progressPercent =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : (item.progressPercent ?? 0);
      return {
        id: item.id,
        title: item.name,
        thumbnail: "/placeholder.svg",
        completedLessons,
        totalLessons,
        progressPercent,
        isComplete: item.isComplete ?? progressPercent >= 100,
      } satisfies ProgressTrailSummary;
    })
    .sort((a, b) => b.progressPercent - a.progressPercent);

  return {
    stats: {
      ...stats,
      completedTrails: trails.filter((trail) => trail.isComplete).length,
      totalTrails: trails.length,
    },
    weeklyStudyData,
    trails,
  };
}
