import { supabase } from "@/lib/supabaseClient"

export type DisciplineAccessBlockReason = "inactive_discipline" | "enrollment_inactive"

export type DisciplineAccessResult =
  | { allowed: true }
  | { allowed: false; reason: DisciplineAccessBlockReason; title: string; message: string }

export async function getDisciplineAccessForStudent(
  profileId: string,
  disciplineId: string,
): Promise<DisciplineAccessResult> {
  const { data: discipline, error: disciplineError } = await supabase
    .from("lxp_course_disciplines")
    .select("id,status,course_period_id")
    .eq("id", disciplineId)
    .maybeSingle()

  if (disciplineError) throw disciplineError
  if (!discipline) {
    return {
      allowed: false,
      reason: "inactive_discipline",
      title: "Disciplina indisponível",
      message: "Esta disciplina não foi encontrada ou não está disponível.",
    }
  }

  if (discipline.status === "inactive") {
    return {
      allowed: false,
      reason: "inactive_discipline",
      title: "Disciplina inativa",
      message:
        "Esta disciplina está temporariamente indisponível no seu curso. Entre em contato com a instituição para mais informações.",
    }
  }

  const { data: period, error: periodError } = await supabase
    .from("lxp_course_periods")
    .select("course_id")
    .eq("id", discipline.course_period_id)
    .maybeSingle()

  if (periodError) throw periodError
  if (!period?.course_id) {
    return { allowed: true }
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("lxp_enrollments")
    .select("status")
    .eq("student_profile_id", profileId)
    .eq("course_id", period.course_id)
    .maybeSingle()

  if (enrollmentError) throw enrollmentError

  if (enrollment?.status === "inactive") {
    return {
      allowed: false,
      reason: "enrollment_inactive",
      title: "Matrícula inativa neste curso",
      message:
        "Sua matrícula neste curso está inativa. Você não pode acessar as disciplinas até a matrícula ser reativada.",
    }
  }

  return { allowed: true }
}
