import { supabase } from "@/lib/supabaseClient";
import type { EnrolledCourse } from "@/types/enrollment";

type EnrollmentRow = { course_id: string; status: string; created_at: string | null };

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
