import { supabase } from "@/lib/supabaseClient"

const SIGNATURES_BUCKET = "certificate-signatures"

export type CertificateSnapshot = {
  student_name: string
  discipline_name: string
  discipline_code?: string | null
  workload_hours: number | null
  instructor_name: string | null
  institution_name: string
  institution_logo_url: string | null
  layout_kind?: "default" | "custom"
  background_image_url?: string | null
  completed_at: string | null
  template_id: string | null
  signatures: Array<{
    slot: number
    signer_name: string
    signer_title: string
    image_url: string | null
  }>
}

export async function resolveDefaultCertificateTemplateId(): Promise<string | null> {
  const { data, error } = await supabase.rpc("lxp_get_default_certificate_template_id")
  if (!error && data) return data as string

  const { data: row, error: fallbackError } = await supabase
    .from("lxp_certificate_templates")
    .select("id")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (fallbackError) throw fallbackError
  return row?.id ?? null
}

export function certificateSignaturePublicUrl(
  imagePath: string | null | undefined,
): string | null {
  if (!imagePath?.trim()) return null
  const { data } = supabase.storage.from(SIGNATURES_BUCKET).getPublicUrl(imagePath.trim())
  return data.publicUrl || null
}

function buildValidationCode(): string {
  const raw = crypto.randomUUID().replace(/-/g, "").slice(0, 20).toUpperCase()
  return `B42-${raw}`
}

type TemplateInfoRow = {
  id: string
  institution_name: string | null
  institution_logo_path: string | null
  layout_kind: "default" | "custom" | null
  background_image_path: string | null
}

type SlotRow = {
  signature_id: string
  slot: number
  lxp_certificate_signatures: {
    signer_name: string
    signer_title: string
    image_path: string | null
  } | null
}

/**
 * Monta o snapshot imutavel da emissao a partir dos dados ao vivo
 * (perfil + disciplina + template + assinaturas vinculadas).
 */
export async function buildCertificateSnapshot(params: {
  studentProfileId: string
  courseDisciplineId: string
  templateId: string | null
}): Promise<CertificateSnapshot> {
  const [{ data: profile }, { data: discipline }, { data: progress }] = await Promise.all([
    supabase.from("lxp_profiles").select("name").eq("id", params.studentProfileId).maybeSingle(),
    supabase
      .from("lxp_course_disciplines")
      .select("name,code,professor,workload")
      .eq("id", params.courseDisciplineId)
      .maybeSingle(),
    supabase
      .from("lxp_student_discipline_progress")
      .select("completed_at,last_updated_at")
      .eq("student_profile_id", params.studentProfileId)
      .eq("course_discipline_id", params.courseDisciplineId)
      .maybeSingle(),
  ])

  let template: TemplateInfoRow | null = null
  let slots: SlotRow[] = []

  if (params.templateId) {
    const [tplRes, slotRes] = await Promise.all([
      supabase
        .from("lxp_certificate_templates")
        .select("id,institution_name,institution_logo_path,layout_kind,background_image_path")
        .eq("id", params.templateId)
        .maybeSingle(),
      supabase
        .from("lxp_certificate_template_signatures")
        .select(
          "signature_id,slot,lxp_certificate_signatures(signer_name,signer_title,image_path)",
        )
        .eq("template_id", params.templateId)
        .order("slot", { ascending: true }),
    ])
    template = (tplRes.data as TemplateInfoRow | null) ?? null
    slots = (slotRes.data as SlotRow[] | null) ?? []
  }

  const signatures = slots
    .filter((s) => s.lxp_certificate_signatures)
    .map((s) => ({
      slot: s.slot,
      signer_name: s.lxp_certificate_signatures!.signer_name,
      signer_title: s.lxp_certificate_signatures!.signer_title,
      image_url: certificateSignaturePublicUrl(s.lxp_certificate_signatures!.image_path),
    }))

  return {
    student_name:
      (profile as { name: string | null } | null)?.name?.trim() || "Aluno(a)",
    discipline_name:
      (discipline as { name: string | null } | null)?.name?.trim() ||
      (discipline as { code: string | null } | null)?.code?.trim() ||
      "Disciplina",
    discipline_code: (discipline as { code: string | null } | null)?.code ?? null,
    workload_hours:
      ((discipline as { workload: number | null } | null)?.workload ?? null) ?? null,
    instructor_name:
      (discipline as { professor: string | null } | null)?.professor?.trim() || null,
    institution_name: template?.institution_name?.trim() || "B42 Edtech",
    institution_logo_url: certificateSignaturePublicUrl(template?.institution_logo_path),
    layout_kind: template?.layout_kind === "custom" ? "custom" : "default",
    background_image_url: certificateSignaturePublicUrl(template?.background_image_path),
    completed_at:
      (progress as { completed_at: string | null } | null)?.completed_at ??
      (progress as { last_updated_at: string | null } | null)?.last_updated_at ??
      null,
    template_id: params.templateId,
    signatures,
  }
}

/**
 * Garante uma linha em `lxp_certificate_issues` por (aluno, disciplina) e
 * grava o snapshot imutavel na primeira emissao.
 */
export async function ensureCertificateIssue(params: {
  studentProfileId: string
  courseDisciplineId: string
}): Promise<string> {
  const { data: existing, error: selErr } = await supabase
    .from("lxp_certificate_issues")
    .select("validation_code,template_id,snapshot")
    .eq("student_profile_id", params.studentProfileId)
    .eq("course_discipline_id", params.courseDisciplineId)
    .maybeSingle()

  if (selErr) throw selErr

  if (existing?.validation_code && typeof existing.validation_code === "string") {
    if (!existing.snapshot) {
      await backfillIssueSnapshot({
        studentProfileId: params.studentProfileId,
        courseDisciplineId: params.courseDisciplineId,
        templateId: existing.template_id as string | null,
      })
    }
    return existing.validation_code
  }

  const templateId = await resolveDefaultCertificateTemplateId()
  const snapshot = await buildCertificateSnapshot({
    studentProfileId: params.studentProfileId,
    courseDisciplineId: params.courseDisciplineId,
    templateId,
  })

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const validation_code = buildValidationCode()
    const { error: insErr } = await supabase.from("lxp_certificate_issues").insert({
      student_profile_id: params.studentProfileId,
      course_discipline_id: params.courseDisciplineId,
      validation_code,
      template_id: templateId,
      snapshot,
      completed_at: snapshot.completed_at,
    })
    if (!insErr) return validation_code
    if (insErr.code === "23505") {
      const retry = await supabase
        .from("lxp_certificate_issues")
        .select("validation_code")
        .eq("student_profile_id", params.studentProfileId)
        .eq("course_discipline_id", params.courseDisciplineId)
        .maybeSingle()
      if (retry.error) throw retry.error
      if (retry.data?.validation_code) return retry.data.validation_code as string
      continue
    }
    throw insErr
  }

  throw new Error("Nao foi possivel registrar emissao de certificado (codigo unico).")
}

/** Reidrata snapshot em emissoes legadas (sem snapshot gravado). */
export async function backfillIssueSnapshot(params: {
  studentProfileId: string
  courseDisciplineId: string
  templateId: string | null
}): Promise<void> {
  let templateId = params.templateId
  if (!templateId) templateId = await resolveDefaultCertificateTemplateId()

  const snapshot = await buildCertificateSnapshot({
    studentProfileId: params.studentProfileId,
    courseDisciplineId: params.courseDisciplineId,
    templateId,
  })

  await supabase
    .from("lxp_certificate_issues")
    .update({
      snapshot,
      template_id: templateId,
      completed_at: snapshot.completed_at,
    })
    .eq("student_profile_id", params.studentProfileId)
    .eq("course_discipline_id", params.courseDisciplineId)
    .is("snapshot", null)
}
