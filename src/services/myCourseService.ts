import { supabase } from "@/lib/supabaseClient";
import type { MyCourseData, MyCoursePeriod, MyCourseSummary, SubjectStatus } from "@/types/myCourse";

type EnrollmentRow = { course_id: string; created_at?: string | null; status: string };
type CourseRow = { id: string; name: string; description: string | null; status: string; created_at: string };

function deriveSubjectStatus(
  progress: { status: SubjectStatus } | undefined,
  hasContentLink: boolean,
): SubjectStatus {
  if (!hasContentLink) return "pending";
  return progress?.status ?? "pending";
}

function resolvePeriodStatus(
  subjectStatuses: SubjectStatus[],
  subjectComplete: boolean[],
): MyCoursePeriod["status"] {
  if (subjectComplete.length > 0 && subjectComplete.every(Boolean)) return "completed";
  if (subjectStatuses.some((s) => s === "in_progress" || s === "approved")) return "current";
  return "future";
}

async function buildCourseOverview(
  profileId: string,
  enrollment: EnrollmentRow,
): Promise<MyCourseData | null> {
  const { data: courseData, error: courseError } = await supabase
    .from("lxp_courses")
    .select("id,name,description,status,created_at")
    .eq("id", enrollment.course_id)
    .maybeSingle();
  if (courseError) throw courseError;
  if (!courseData) return null;

  const { data: periodRows, error: periodsError } = await supabase
    .from("lxp_course_periods")
    .select("id,number,name,lxp_course_disciplines(id,name,code,workload,credits,professor,status)")
    .eq("course_id", enrollment.course_id)
    .order("number", { ascending: true });
  if (periodsError) throw periodsError;

  const disciplineIds =
    (periodRows ?? []).flatMap((period) =>
      ((period as { lxp_course_disciplines?: { id: string }[] }).lxp_course_disciplines ?? []).map(
        (discipline) => discipline.id,
      ),
    ) ?? [];

  let progressByDisciplineId = new Map<string, { status: SubjectStatus; grade: number | null }>();
  let linkByDisciplineId = new Set<string>();

  if (disciplineIds.length > 0) {
    const [{ data: progressRows, error: progressError }, { data: linkRows, error: linksError }] =
      await Promise.all([
        supabase
          .from("lxp_student_discipline_progress")
          .select("course_discipline_id,status,grade")
          .eq("student_profile_id", profileId)
          .in("course_discipline_id", disciplineIds),
        supabase
          .from("lxp_course_library_links")
          .select("course_discipline_id")
          .eq("library_content_type", "discipline")
          .in("course_discipline_id", disciplineIds),
      ]);

    if (progressError) throw progressError;
    if (linksError) throw linksError;

    progressByDisciplineId = new Map(
      ((progressRows ?? []) as Array<{ course_discipline_id: string; status: SubjectStatus; grade: number | null }>).map(
        (row) => [row.course_discipline_id, row],
      ),
    );
    linkByDisciplineId = new Set(
      (linkRows ?? []).map((row) => row.course_discipline_id as string),
    );
  }

  const enrollmentInactive = enrollment.status === "inactive";

  const periods: MyCoursePeriod[] = (periodRows ?? []).map((period: {
    id: string;
    number: number;
    name: string;
    lxp_course_disciplines?: Array<{
      id: string;
      name: string;
      code: string;
      workload: number;
      credits: number;
      professor?: string;
      status?: string;
    }>;
  }) => {
    const subjects = (period.lxp_course_disciplines ?? []).map((discipline) => {
      const progress = progressByDisciplineId.get(discipline.id);
      const hasContentLink = linkByDisciplineId.has(discipline.id);
      const status = deriveSubjectStatus(progress, hasContentLink);
      const isComplete = status === "approved";

      return {
        id: discipline.id,
        name: discipline.name,
        code: discipline.code,
        workload: discipline.workload ?? 0,
        credits: discipline.credits ?? 0,
        professor: discipline.professor ?? undefined,
        status,
        grade: progress?.grade ?? undefined,
        disciplineInactive: (discipline.status ?? "active") === "inactive",
        enrollmentInactive,
        hasContentLink,
        progressPercent: isComplete ? 100 : status === "in_progress" ? 50 : 0,
        isComplete,
      };
    });

    return {
      id: period.id,
      number: period.number,
      name: period.name,
      status: resolvePeriodStatus(
        subjects.map((s) => s.status),
        subjects.map((s) => s.isComplete),
      ),
      subjects,
    };
  });

  return {
    ...(courseData as CourseRow),
    periods,
  };
}

function summarizeCourse(course: MyCourseData): Pick<MyCourseSummary, "totalDisciplines" | "completedDisciplines" | "progressPercent"> {
  const linkedSubjects = course.periods.flatMap((p) =>
    p.subjects.filter((s) => s.hasContentLink),
  );
  const totalDisciplines = linkedSubjects.length;
  const completedDisciplines = linkedSubjects.filter((s) => s.isComplete).length;
  const progressPercent =
    totalDisciplines > 0 ? Math.round((completedDisciplines / totalDisciplines) * 100) : 0;
  return { totalDisciplines, completedDisciplines, progressPercent };
}

export async function listMyCourseSummaries(profileId: string): Promise<MyCourseSummary[]> {
  const { data: enrollmentsData, error: enrollmentsError } = await supabase
    .from("lxp_enrollments")
    .select("course_id,created_at,status")
    .eq("student_profile_id", profileId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (enrollmentsError) throw enrollmentsError;

  const enrollments = (enrollmentsData as EnrollmentRow[] | null) ?? [];
  const summaries: MyCourseSummary[] = [];

  for (const enrollment of enrollments) {
    const overview = await buildCourseOverview(profileId, enrollment);
    if (!overview) continue;
    const stats = summarizeCourse(overview);
    summaries.push({
      id: overview.id,
      name: overview.name,
      description: overview.description,
      status: overview.status,
      created_at: overview.created_at,
      ...stats,
    });
  }

  return summaries;
}

export async function getMyCourseOverview(
  profileId: string,
  courseId: string,
): Promise<MyCourseData | null> {
  const { data: enrollment, error: enrollmentError } = await supabase
    .from("lxp_enrollments")
    .select("course_id,created_at,status")
    .eq("student_profile_id", profileId)
    .eq("course_id", courseId)
    .eq("status", "active")
    .maybeSingle();

  if (enrollmentError) throw enrollmentError;
  if (!enrollment?.course_id) return null;

  return buildCourseOverview(profileId, enrollment as EnrollmentRow);
}
