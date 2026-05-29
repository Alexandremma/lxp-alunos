import { supabase } from "@/lib/supabaseClient";

export type PublicCertificateValidation = {
  valid: true;
  validationCode: string;
  studentName: string;
  disciplineName: string;
  issuedAt: string;
  workloadHours: number | null;
  instructorName: string | null;
};

export type PublicCertificateValidationError = {
  valid: false;
  message: string;
};

export type PublicCertificateValidationResult =
  | PublicCertificateValidation
  | PublicCertificateValidationError;

export async function validateCertificateByCode(
  code: string,
): Promise<PublicCertificateValidationResult> {
  const trimmed = code.trim();
  if (!trimmed) {
    return { valid: false, message: "Informe o código de validação." };
  }

  const { data, error } = await supabase.rpc("lxp_validate_certificate_public", {
    p_validation_code: trimmed,
  });

  if (error) throw error;

  const row = data as Record<string, unknown> | null;
  if (!row || row.valid !== true) {
    return {
      valid: false,
      message:
        (typeof row?.message === "string" && row.message) ||
        "Código não encontrado ou inválido.",
    };
  }

  return {
    valid: true,
    validationCode: String(row.validation_code ?? trimmed),
    studentName: String(row.student_name ?? "—"),
    disciplineName: String(row.discipline_name ?? "—"),
    issuedAt: String(row.issued_at ?? new Date().toISOString()),
    workloadHours:
      row.workload_hours != null && Number.isFinite(Number(row.workload_hours))
        ? Number(row.workload_hours)
        : null,
    instructorName:
      row.instructor_name != null ? String(row.instructor_name) : null,
  };
}
