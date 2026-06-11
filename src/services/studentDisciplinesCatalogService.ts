import { supabase } from "@/lib/supabaseClient";
import { fetchDisciplineProgressFromDb } from "@/services/disciplineProgressService";
import type {
  CourseCategory,
  DisciplineProgressStatus,
  StudentDisciplineCatalogItem,
  StudentDisciplinesCatalogParams,
  StudentDisciplinesCatalogResponse,
} from "@/types/studentCatalog";

type RawDisciplineRow = {
  id: string;
  name: string;
  code: string;
  workload: number | null;
  credits: number | null;
  professor: string | null;
  status: string;
  course_period_id: string;
};

function resolveProgressStatus(params: {
  disciplineInactive: boolean;
  enrollmentInactive: boolean;
  isEnrolledInCourse: boolean;
  isComplete: boolean;
  isFreeCourse: boolean;
}): DisciplineProgressStatus {
  if (params.disciplineInactive) return "discipline_inactive";
  if (params.enrollmentInactive) return "enrollment_inactive";
  if (params.isComplete) return "completed";
  if (params.isEnrolledInCourse) return "enrolled";
  if (params.isFreeCourse) return "available";
  return "available";
}

export async function getStudentDisciplinesCatalog(
  profileId: string,
  params: StudentDisciplinesCatalogParams = {},
): Promise<StudentDisciplinesCatalogResponse> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 15;
  const q = params.q?.trim().toLowerCase() ?? "";
  const categoryFilter = params.category ?? "all";
  const progressFilter = params.progressStatus ?? "all";
  const courseFilter = params.courseId;

  const { data: enrollments, error: e1 } = await supabase
    .from("lxp_enrollments")
    .select("course_id,status")
    .eq("student_profile_id", profileId);
  if (e1) throw e1;

  const enrollmentByCourse = new Map(
    (enrollments ?? []).map((r) => [r.course_id as string, r.status as string]),
  );
  const enrolledCourseIds = new Set(
    [...enrollmentByCourse.entries()]
      .filter(([, status]) => status === "active")
      .map(([id]) => id),
  );

  const enrolledCourseIdList = [...enrolledCourseIds];
  const [{ data: enrolledCourses, error: e2a }, { data: freeCourses, error: e2b }] =
    await Promise.all([
      enrolledCourseIdList.length > 0
        ? supabase
            .from("lxp_courses")
            .select("id,name,category,status")
            .in("id", enrolledCourseIdList)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("lxp_courses")
        .select("id,name,category,status")
        .eq("category", "free_course")
        .eq("status", "active"),
    ]);

  if (e2a) throw e2a;
  if (e2b) throw e2b;

  const courseMeta = new Map<string, { name: string; category: CourseCategory; status: string }>();
  for (const c of [...(enrolledCourses ?? []), ...(freeCourses ?? [])]) {
    courseMeta.set(c.id as string, {
      name: (c.name as string)?.trim() || "Curso",
      category: (c.category as CourseCategory) ?? "graduation",
      status: c.status as string,
    });
  }

  const visibleCourseIds = new Set(courseMeta.keys());
  if (visibleCourseIds.size === 0) {
    return { items: [], total: 0, page, pageSize };
  }

  const courseIds = [...visibleCourseIds];
  const { data: periods, error: e3 } = await supabase
    .from("lxp_course_periods")
    .select("id,course_id")
    .in("course_id", courseIds);
  if (e3) throw e3;

  const periodIds = (periods ?? []).map((p) => p.id as string);
  const courseByPeriod = new Map((periods ?? []).map((p) => [p.id as string, p.course_id as string]));
  if (periodIds.length === 0) {
    return { items: [], total: 0, page, pageSize };
  }

  const { data: disciplines, error: e4 } = await supabase
    .from("lxp_course_disciplines")
    .select("id,name,code,workload,credits,professor,course_period_id,status")
    .in("course_period_id", periodIds);
  if (e4) throw e4;

  const disciplineRows = (disciplines ?? []) as RawDisciplineRow[];
  const discIds = disciplineRows.map((d) => d.id);
  if (discIds.length === 0) {
    return { items: [], total: 0, page, pageSize };
  }

  const { data: links, error: e5 } = await supabase
    .from("lxp_course_library_links")
    .select("course_discipline_id")
    .eq("library_content_type", "discipline")
    .in("course_discipline_id", discIds);
  if (e5) throw e5;

  const linkByDisc = new Set((links ?? []).map((l) => l.course_discipline_id as string));
  const linkedDiscIds = disciplineRows.filter((d) => linkByDisc.has(d.id)).map((d) => d.id);

  const progressByDisc = await fetchDisciplineProgressFromDb(profileId, linkedDiscIds);

  const items: StudentDisciplineCatalogItem[] = [];

  for (const d of disciplineRows) {
    if (!linkByDisc.has(d.id)) continue;

    const courseId = courseByPeriod.get(d.course_period_id);
    if (!courseId) continue;

    const meta = courseMeta.get(courseId);
    if (!meta) continue;

    const isFreeCourse = meta.category === "free_course";
    const isEnrolledActive = enrolledCourseIds.has(courseId);
    const enrollmentStatus = enrollmentByCourse.get(courseId);
    const isEnrolledInCourse = enrollmentStatus === "active" || enrollmentStatus === "inactive";

    if (!isFreeCourse && !isEnrolledInCourse) continue;
    if (isFreeCourse && meta.status !== "active") continue;

    const disciplineInactive = d.status === "inactive";
    const enrollmentInactive = enrollmentStatus === "inactive";
    const progress = progressByDisc.get(d.id);
    const isComplete = progress?.isComplete ?? false;
    const progressStatus = resolveProgressStatus({
      disciplineInactive,
      enrollmentInactive,
      isEnrolledInCourse: isEnrolledActive,
      isComplete,
      isFreeCourse,
    });

    const canSelfEnroll =
      isFreeCourse &&
      meta.status === "active" &&
      !disciplineInactive &&
      !isEnrolledActive &&
      progressStatus === "available";

    const name = d.name?.trim() ?? d.code ?? "Disciplina";
    const code = (d.code ?? "").toLowerCase();

    items.push({
      id: d.id,
      name,
      code: d.code,
      courseId,
      courseName: meta.name,
      courseCategory: meta.category,
      progressStatus,
      progressPercent: progress?.progressPercent ?? 0,
      canSelfEnroll,
      workloadHours: d.workload != null && d.workload > 0 ? d.workload : undefined,
      credits: d.credits != null && d.credits > 0 ? d.credits : undefined,
      professor: d.professor?.trim() || undefined,
    });
  }

  let filtered = items;

  if (q) {
    filtered = filtered.filter(
      (item) => item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q),
    );
  }

  if (courseFilter && courseFilter !== "all") {
    filtered = filtered.filter((item) => item.courseId === courseFilter);
  }

  if (categoryFilter !== "all") {
    filtered = filtered.filter((item) => item.courseCategory === categoryFilter);
  }

  if (progressFilter !== "all") {
    filtered = filtered.filter((item) => item.progressStatus === progressFilter);
  }

  filtered.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return { items: paged, total, page, pageSize };
}

/** KPI stats sobre o conjunto completo (sem paginação). */
export async function getStudentDisciplinesCatalogStats(profileId: string) {
  const { items } = await getStudentDisciplinesCatalog(profileId, {
    page: 1,
    pageSize: Number.MAX_SAFE_INTEGER,
  });

  const hours = items
    .filter((i) => i.progressStatus === "enrolled" || i.progressStatus === "completed")
    .reduce((acc, i) => {
      const workload = i.workloadHours ?? 0;
      const pct = i.progressStatus === "completed" ? 100 : i.progressPercent;
      return acc + workload * (pct / 100);
    }, 0);

  return {
    enrolled: items.filter((i) => i.progressStatus === "enrolled").length,
    completed: items.filter((i) => i.progressStatus === "completed").length,
    available: items.filter((i) => i.progressStatus === "available").length,
    hoursStudied: Number(hours.toFixed(1)),
  };
}
