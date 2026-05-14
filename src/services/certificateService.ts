import { supabase } from "@/lib/supabaseClient"
import { ensureCertificateIssue } from "@/services/certificateIssueService"

export type CertificateDetail = {
  id: string
  courseTitle: string
  studentName: string
  issuedAt: string
  codeHash: string
  instructor: string
}

type DisciplineRow = {
  id: string
  name: string | null
  code: string | null
  professor: string | null
}

type DisciplineProgressRow = {
  status: string | null
  completed_at: string | null
  last_updated_at: string | null
  created_at: string | null
}

type IssueRow = {
  validation_code: string
  issued_at: string
}

function isCompleted(row: DisciplineProgressRow | null): boolean {
  if (!row) return false
  return row.status === "approved"
}

export async function getCertificateDetail(params: {
  profileId: string
  courseDisciplineId: string
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
        .select("status,completed_at,last_updated_at,created_at")
        .eq("student_profile_id", params.profileId)
        .eq("course_discipline_id", params.courseDisciplineId)
        .maybeSingle(),
    ])

  if (profileError) throw profileError
  if (disciplineError) throw disciplineError
  if (progressResult.error) throw progressResult.error

  const progress = progressResult.data as DisciplineProgressRow | null
  const disciplineRow = discipline as DisciplineRow | null

  if (!disciplineRow || !isCompleted(progress)) return null

  let issue: IssueRow | null = null
  const issueResult = await supabase
    .from("lxp_certificate_issues")
    .select("validation_code,issued_at")
    .eq("student_profile_id", params.profileId)
    .eq("course_discipline_id", params.courseDisciplineId)
    .maybeSingle()

  if (issueResult.error) throw issueResult.error
  if (issueResult.data?.validation_code && issueResult.data?.issued_at) {
    issue = {
      validation_code: issueResult.data.validation_code as string,
      issued_at: issueResult.data.issued_at as string,
    }
  }

  let validationCode = issue?.validation_code
  if (!validationCode) {
    validationCode = await ensureCertificateIssue({
      studentProfileId: params.profileId,
      courseDisciplineId: params.courseDisciplineId,
    })
    const again = await supabase
      .from("lxp_certificate_issues")
      .select("validation_code,issued_at")
      .eq("student_profile_id", params.profileId)
      .eq("course_discipline_id", params.courseDisciplineId)
      .maybeSingle()
    if (again.error) throw again.error
    if (again.data?.issued_at) {
      issue = {
        validation_code: validationCode,
        issued_at: again.data.issued_at as string,
      }
    }
  }

  const studentName = profile?.name?.trim() || "Aluno(a)"
  const courseTitle = disciplineRow.name?.trim() || disciplineRow.code?.trim() || "Disciplina"
  const issuedAt =
    issue?.issued_at ??
    progress?.completed_at ??
    progress?.last_updated_at ??
    progress?.created_at ??
    new Date().toISOString()

  return {
    id: `cert-${disciplineRow.id}`,
    courseTitle,
    studentName,
    issuedAt,
    codeHash: validationCode ?? `B42-${disciplineRow.id.slice(0, 8).toUpperCase()}-${params.profileId.slice(0, 6).toUpperCase()}`,
    instructor: disciplineRow.professor?.trim() || "Equipe Acadêmica",
  }
}
