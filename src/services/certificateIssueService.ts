import { supabase } from "@/lib/supabaseClient"

function buildValidationCode(): string {
  const raw = crypto.randomUUID().replace(/-/g, "").slice(0, 20).toUpperCase()
  return `B42-${raw}`
}

/**
 * Garante uma linha em `lxp_certificate_issues` por (aluno, disciplina).
 * Idempotente; retorna o código de validação existente ou recém-criado.
 */
export async function ensureCertificateIssue(params: {
  studentProfileId: string
  courseDisciplineId: string
}): Promise<string> {
  const { data: existing, error: selErr } = await supabase
    .from("lxp_certificate_issues")
    .select("validation_code")
    .eq("student_profile_id", params.studentProfileId)
    .eq("course_discipline_id", params.courseDisciplineId)
    .maybeSingle()

  if (selErr) throw selErr
  const code = existing?.validation_code
  if (code && typeof code === "string") return code

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const validation_code = buildValidationCode()
    const { error: insErr } = await supabase.from("lxp_certificate_issues").insert({
      student_profile_id: params.studentProfileId,
      course_discipline_id: params.courseDisciplineId,
      validation_code,
      template_id: null,
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
