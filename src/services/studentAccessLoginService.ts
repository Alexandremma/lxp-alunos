import { supabase } from "@/lib/supabaseClient"

export const STUDENT_BLOCKED_MESSAGE =
  "Sua conta está bloqueada. Entre em contato com a instituição para mais informações."

/**
 * Verifica se o aluno não pode acessar o portal por bloqueio de matrícula.
 * Regra: se existir ao menos uma matrícula e todas forem `blocked`, o acesso é negado.
 */
export async function isStudentEnrollmentBlocked(profileId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("lxp_enrollments")
    .select("status")
    .eq("student_profile_id", profileId)

  if (error) throw error
  const rows = data ?? []
  if (rows.length === 0) return false
  return rows.every((row) => row.status === "blocked")
}

export async function isStudentEnrollmentBlockedByUserId(userId: string): Promise<boolean> {
  const { data: profile, error } = await supabase
    .from("lxp_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) throw error
  if (!profile?.id) return false
  return isStudentEnrollmentBlocked(profile.id as string)
}
