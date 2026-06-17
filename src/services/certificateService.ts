import { supabase } from "@/lib/supabaseClient"
import { enrichCertificateSnapshot } from "@/services/certificateEnrichmentService"
import { getDisciplineProgressSnapshot } from "@/services/disciplineProgressService"
import {
  backfillIssueSnapshot,
  buildCertificateSnapshot,
  ensureCertificateIssue,
  type CertificateSnapshot,
} from "@/services/certificateIssueService"
import { buildCertificateValidationUrl } from "@/lib/certificatePublicUrls"
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

function snapshotToDetail(
  issue: { id: string; validation_code: string; issued_at: string },
  snapshot: CertificateSnapshot,
): CertificateDetail {
  const signatures = (snapshot.signatures ?? [])
    .slice()
    .sort((a, b) => {
      const slotA = typeof a.slot === "number" ? a.slot : Number(a.slot) || 0
      const slotB = typeof b.slot === "number" ? b.slot : Number(b.slot) || 0
      return slotA - slotB
    })
    .map((s) => {
      const entry = s as Record<string, unknown>
      return {
        signerName: String(entry.signer_name ?? entry.signerName ?? ""),
        signerTitle: String(entry.signer_title ?? entry.signerTitle ?? ""),
        imageUrl:
          (entry.image_url as string | null | undefined) ??
          (entry.imageUrl as string | null | undefined) ??
          null,
      }
    })

  const validationUrl = buildCertificateValidationUrl(issue.validation_code)

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
    validationUrl,
  }
}

export async function getCertificateDetail(params: {
  profileId: string
  courseDisciplineId: string
  completedLessons?: number
  totalLessons?: number
}): Promise<CertificateDetail | null> {
  const ready = await isDisciplineCertificateReady({
    profileId: params.profileId,
    courseDisciplineId: params.courseDisciplineId,
    completedLessons: params.completedLessons ?? 0,
    totalLessons: params.totalLessons ?? 0,
  })
  if (!ready) return null

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

  // Snapshot ja gravado: fonte da verdade (enriquecido com midia do template se ausente)
  if (issue.snapshot) {
    const enriched = await enrichCertificateSnapshot(
      issue.snapshot,
      issue.template_id,
    )
    return snapshotToDetail(issue, enriched)
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

/** Disciplina concluída quando 100% das aulas do catálogo estão completed (matched). */
export async function isDisciplineCertificateReady(params: {
  profileId: string
  courseDisciplineId: string
  completedLessons: number
  totalLessons: number
}): Promise<boolean> {
  if (params.totalLessons > 0 && params.completedLessons >= params.totalLessons) {
    return true
  }

  const snap = await getDisciplineProgressSnapshot(params.profileId, params.courseDisciplineId)
  return snap.isComplete
}
