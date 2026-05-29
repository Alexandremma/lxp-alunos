import { supabase } from "@/lib/supabaseClient"
import {
  backfillIssueSnapshot,
  buildCertificateSnapshot,
  ensureCertificateIssue,
  type CertificateSnapshot,
} from "@/services/certificateIssueService"
import type { CertificatePrintSignature } from "@/lib/certificatePrint"

export type CertificateDetail = {
  id: string
  courseTitle: string
  studentName: string
  issuedAt: string
  codeHash: string
  instructor: string
  workloadHours: number | null
  institutionName: string
  institutionLogoUrl: string | null
  signatures: CertificatePrintSignature[]
  validationUrl: string
}

type IssueRow = {
  id: string
  validation_code: string
  issued_at: string
  template_id: string | null
  snapshot: CertificateSnapshot | null
}

type DisciplineProgressRow = {
  status: string | null
  completed_at: string | null
  last_updated_at: string | null
  created_at: string | null
}

function isCompleted(row: DisciplineProgressRow | null): boolean {
  if (!row) return false
  return row.status === "approved"
}

function snapshotToDetail(
  issue: { id: string; validation_code: string; issued_at: string },
  snapshot: CertificateSnapshot,
): CertificateDetail {
  const signatures = (snapshot.signatures ?? [])
    .slice()
    .sort((a, b) => a.slot - b.slot)
    .map((s) => ({
      signerName: s.signer_name,
      signerTitle: s.signer_title,
      imageUrl: s.image_url,
    }))

  const validationPath = `/validar-certificado?code=${encodeURIComponent(issue.validation_code)}`

  return {
    id: issue.id,
    courseTitle: snapshot.discipline_name,
    studentName: snapshot.student_name,
    issuedAt: issue.issued_at,
    codeHash: issue.validation_code,
    instructor: snapshot.instructor_name?.trim() || "Equipe Acadêmica",
    workloadHours: snapshot.workload_hours,
    institutionName: snapshot.institution_name || "B42 Edtech",
    institutionLogoUrl: snapshot.institution_logo_url ?? null,
    signatures,
    validationUrl: validationPath,
  }
}

export async function getCertificateDetail(params: {
  profileId: string
  courseDisciplineId: string
}): Promise<CertificateDetail | null> {
  const progressRes = await supabase
    .from("lxp_student_discipline_progress")
    .select("status,completed_at,last_updated_at,created_at")
    .eq("student_profile_id", params.profileId)
    .eq("course_discipline_id", params.courseDisciplineId)
    .maybeSingle()

  if (progressRes.error) throw progressRes.error
  const progress = progressRes.data as DisciplineProgressRow | null
  if (!isCompleted(progress)) return null

  let issueRes = await supabase
    .from("lxp_certificate_issues")
    .select("id,validation_code,issued_at,template_id,snapshot")
    .eq("student_profile_id", params.profileId)
    .eq("course_discipline_id", params.courseDisciplineId)
    .maybeSingle()
  if (issueRes.error) throw issueRes.error
  let issue = issueRes.data as IssueRow | null

  if (!issue) {
    await ensureCertificateIssue({
      studentProfileId: params.profileId,
      courseDisciplineId: params.courseDisciplineId,
    })
    issueRes = await supabase
      .from("lxp_certificate_issues")
      .select("id,validation_code,issued_at,template_id,snapshot")
      .eq("student_profile_id", params.profileId)
      .eq("course_discipline_id", params.courseDisciplineId)
      .maybeSingle()
    if (issueRes.error) throw issueRes.error
    issue = issueRes.data as IssueRow | null
  }

  if (!issue) return null

  // Snapshot ja gravado: fonte da verdade
  if (issue.snapshot) {
    return snapshotToDetail(issue, issue.snapshot)
  }

  // Emissao legada sem snapshot: reidrata e atualiza no banco
  const snapshot = await buildCertificateSnapshot({
    studentProfileId: params.profileId,
    courseDisciplineId: params.courseDisciplineId,
    templateId: issue.template_id,
  })
  await backfillIssueSnapshot({
    studentProfileId: params.profileId,
    courseDisciplineId: params.courseDisciplineId,
    templateId: issue.template_id,
  })
  return snapshotToDetail(issue, snapshot)
}

/** Disciplina concluída (100% das aulas ou status approved). */
export async function isDisciplineCertificateReady(params: {
  profileId: string
  courseDisciplineId: string
  completedLessons: number
  totalLessons: number
}): Promise<boolean> {
  if (params.totalLessons > 0 && params.completedLessons >= params.totalLessons) {
    return true
  }

  const { data, error } = await supabase
    .from("lxp_student_discipline_progress")
    .select("status")
    .eq("student_profile_id", params.profileId)
    .eq("course_discipline_id", params.courseDisciplineId)
    .maybeSingle()

  if (error) throw error
  return data?.status === "approved"
}
