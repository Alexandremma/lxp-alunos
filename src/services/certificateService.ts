import { supabase } from "@/lib/supabaseClient";

export type CertificateDetail = {
  id: string;
  courseTitle: string;
  studentName: string;
  issuedAt: string;
  codeHash: string;
  instructor: string;
};

type DisciplineRow = {
  id: string;
  name: string | null;
  code: string | null;
  professor: string | null;
};

type DisciplineProgressRow = {
  status: string | null;
  progress_percent: number | null;
  completed_at: string | null;
  updated_at: string | null;
};

function isCompleted(row: DisciplineProgressRow | null): boolean {
  if (!row) return false;
  return row.status === "approved" || row.status === "completed" || (row.progress_percent ?? 0) >= 100;
}

export async function getCertificateDetail(params: {
  profileId: string;
  courseDisciplineId: string;
}): Promise<CertificateDetail | null> {
  const [{ data: profile, error: profileError }, { data: discipline, error: disciplineError }, progressResult] =
    await Promise.all([
      supabase.from("lxp_profiles").select("id,name").eq("id", params.profileId).maybeSingle(),
      supabase
        .from("lxp_course_disciplines")
        .select("id,name,code,professor")
        .eq("id", params.courseDisciplineId)
        .maybeSingle(),
      supabase
        .from("lxp_student_discipline_progress")
        .select("status,progress_percent,completed_at,updated_at")
        .eq("student_profile_id", params.profileId)
        .eq("course_discipline_id", params.courseDisciplineId)
        .maybeSingle(),
    ]);

  if (profileError) throw profileError;
  if (disciplineError) throw disciplineError;
  if (progressResult.error) throw progressResult.error;

  const progress = progressResult.data as DisciplineProgressRow | null;
  const disciplineRow = discipline as DisciplineRow | null;

  if (!disciplineRow || !isCompleted(progress)) return null;

  const studentName = profile?.name?.trim() || "Aluno(a)";
  const courseTitle = disciplineRow.name?.trim() || disciplineRow.code?.trim() || "Disciplina";
  const issuedAt = progress?.completed_at ?? progress?.updated_at ?? new Date().toISOString();
  const codeHash = `B42-${disciplineRow.id.slice(0, 8).toUpperCase()}-${params.profileId.slice(0, 6).toUpperCase()}`;

  return {
    id: `cert-${disciplineRow.id}`,
    courseTitle,
    studentName,
    issuedAt,
    codeHash,
    instructor: disciplineRow.professor?.trim() || "Equipe Acadêmica",
  };
}
