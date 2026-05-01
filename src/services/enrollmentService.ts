import { supabase } from "@/lib/supabaseClient";
import type { EnrolledCourse } from "@/types/enrollment";

type EnrollmentRow = { course_id: string; status: string; created_at: string | null };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getActiveEnrolledCourses(profileId: string): Promise<EnrolledCourse[]> {
  const { data: enrollmentRows, error: enrollmentError } = await supabase
    .from("lxp_enrollments")
    .select("course_id,status,created_at")
    .eq("student_profile_id", profileId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (enrollmentError) throw enrollmentError;

  const rows = (enrollmentRows ?? []) as EnrollmentRow[];
  if (rows.length === 0) return [];

  const uniqueCourseIds = Array.from(new Set(rows.map((r) => r.course_id)));
  const enrollmentOrder = new Map<string, number>();
  uniqueCourseIds.forEach((courseId, index) => enrollmentOrder.set(courseId, index));

  const { data: courseRows, error: courseError } = await supabase
    .from("lxp_courses")
    .select("id,name,description,status,created_at")
    .in("id", uniqueCourseIds);

  if (courseError) throw courseError;

  const courses = (courseRows ?? []) as EnrolledCourse[];

  return courses.sort((a, b) => {
    const aIndex = enrollmentOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = enrollmentOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
}

async function resolveCourseIdFromDisciplineOrExternal(contentId: string): Promise<string | null> {
  // 1) When ID is a course discipline UUID.
  if (UUID_RE.test(contentId)) {
    const { data: discipline, error: disciplineError } = await supabase
      .from("lxp_course_disciplines")
      .select("course_period_id")
      .eq("id", contentId)
      .maybeSingle();
    if (disciplineError) throw disciplineError;
    if (discipline?.course_period_id) {
      const { data: period, error: periodError } = await supabase
        .from("lxp_course_periods")
        .select("course_id")
        .eq("id", discipline.course_period_id)
        .maybeSingle();
      if (periodError) throw periodError;
      if (period?.course_id) return period.course_id as string;
    }
  }

  // 2) Fallback: map external discipline id -> internal course discipline.
  const { data: link, error: linkError } = await supabase
    .from("lxp_course_library_links")
    .select("course_discipline_id")
    .eq("library_content_type", "discipline")
    .eq("library_content_id", contentId)
    .order("linked_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (linkError) throw linkError;
  if (!link?.course_discipline_id) return null;

  const { data: discipline, error: disciplineError } = await supabase
    .from("lxp_course_disciplines")
    .select("course_period_id")
    .eq("id", link.course_discipline_id)
    .maybeSingle();
  if (disciplineError) throw disciplineError;
  if (!discipline?.course_period_id) return null;

  const { data: period, error: periodError } = await supabase
    .from("lxp_course_periods")
    .select("course_id")
    .eq("id", discipline.course_period_id)
    .maybeSingle();
  if (periodError) throw periodError;
  return (period?.course_id as string | undefined) ?? null;
}

export async function enrollStudentByCatalogContent(params: {
  studentProfileId: string;
  contentId: string;
}): Promise<void> {
  const courseId = await resolveCourseIdFromDisciplineOrExternal(params.contentId);
  if (!courseId) {
    throw new Error("Nao foi possivel localizar o curso desta disciplina para matricula.");
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("lxp_enrollments").upsert(
    {
      student_profile_id: params.studentProfileId,
      course_id: courseId,
      status: "active",
      updated_at: now,
    },
    { onConflict: "student_profile_id,course_id" },
  );
  if (error) throw error;
}
