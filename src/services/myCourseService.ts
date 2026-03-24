import { supabase } from "@/lib/supabaseClient";
import type { MyCourseData, MyCoursePeriod, SubjectStatus } from "@/types/myCourse";

type EnrollmentRow = { course_id: string; created_at?: string | null };
type CourseRow = { id: string; name: string; description: string | null; status: string; created_at: string };
type ProgressRow = { course_discipline_id: string; status: SubjectStatus; grade: number | null };

function resolvePeriodStatus(subjectStatuses: SubjectStatus[]): MyCoursePeriod["status"] {
  if (subjectStatuses.length > 0 && subjectStatuses.every((s) => s === "approved")) return "completed";
  if (subjectStatuses.some((s) => s === "in_progress" || s === "approved")) return "current";
  return "future";
}

export async function getMyCourseOverview(profileId: string): Promise<MyCourseData | null> {
  const { data: enrollmentsData, error: enrollmentsError } = await supabase
    .from("lxp_enrollments")
    .select("course_id,created_at")
    .eq("student_profile_id", profileId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);

  if (enrollmentsError) throw enrollmentsError;

  const enrollment = (enrollmentsData as EnrollmentRow[] | null)?.[0];
  if (!enrollment?.course_id) return null;

  const { data: courseData, error: courseError } = await supabase
    .from("lxp_courses")
    .select("id,name,description,status,created_at")
    .eq("id", enrollment.course_id)
    .maybeSingle();
  if (courseError) throw courseError;
  if (!courseData) return null;

  const { data: periodRows, error: periodsError } = await supabase
    .from("lxp_course_periods")
    .select("id,number,name,lxp_course_disciplines(id,name,code,workload,credits,professor)")
    .eq("course_id", enrollment.course_id)
    .order("number", { ascending: true });
  if (periodsError) throw periodsError;

  const disciplineIds =
    (periodRows ?? []).flatMap((period) =>
      ((period as any).lxp_course_disciplines ?? []).map((discipline: { id: string }) => discipline.id),
    ) ?? [];

  let progressByDisciplineId = new Map<string, ProgressRow>();
  if (disciplineIds.length > 0) {
    const { data: progressRows, error: progressError } = await supabase
      .from("lxp_student_discipline_progress")
      .select("course_discipline_id,status,grade")
      .eq("student_profile_id", profileId)
      .in("course_discipline_id", disciplineIds);

    if (progressError) throw progressError;

    progressByDisciplineId = new Map(
      ((progressRows ?? []) as ProgressRow[]).map((row) => [row.course_discipline_id, row]),
    );
  }

  const periods: MyCoursePeriod[] = (periodRows ?? []).map((period: any) => {
    const subjects = ((period.lxp_course_disciplines ?? []) as Array<{
      id: string;
      name: string;
      code: string;
      workload: number;
      credits: number;
      professor?: string;
    }>).map((discipline) => {
      const progress = progressByDisciplineId.get(discipline.id);
      return {
        id: discipline.id,
        name: discipline.name,
        code: discipline.code,
        workload: discipline.workload ?? 0,
        credits: discipline.credits ?? 0,
        professor: discipline.professor ?? undefined,
        status: progress?.status ?? "pending",
        grade: progress?.grade ?? undefined,
      };
    });

    return {
      id: period.id,
      number: period.number,
      name: period.name,
      status: resolvePeriodStatus(subjects.map((s) => s.status)),
      subjects,
    };
  });

  return {
    ...(courseData as CourseRow),
    periods,
  };
}
