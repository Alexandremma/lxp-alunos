import { supabase } from "@/lib/supabaseClient"
import { courseDisciplineHasLibraryLink } from "@/services/trailAdapter"

export type DisciplineAccessBlockReason =
  | "inactive_discipline"
  | "enrollment_inactive"
  | "no_content_link"
  | "not_enrolled"

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

  const hasLink = await courseDisciplineHasLibraryLink(disciplineId)
  if (!hasLink) {
    return {
      allowed: false,
      reason: "no_content_link",
      title: "Conteúdo em preparação",
      message:
        "Esta disciplina ainda não possui conteúdo vinculado pela instituição. Quando estiver disponível, você poderá acessar as aulas aqui.",
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

  if (!enrollment) {
    return {
      allowed: false,
      reason: "not_enrolled",
      title: "Matrícula necessária",
      message:
        "Inscreva-se nesta disciplina em Minhas Disciplinas para acessar o conteúdo.",
    }
  }

  if (enrollment.status === "inactive") {
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

export async function getDisciplineAccessForModerator(
  disciplineId: string,
): Promise<DisciplineAccessResult> {
  const { data: discipline, error: disciplineError } = await supabase
    .from("lxp_course_disciplines")
    .select("id,status")
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
      message: "Esta disciplina está inativa e não pode ser moderada no momento.",
    }
  }

  const hasLink = await courseDisciplineHasLibraryLink(disciplineId)
  if (!hasLink) {
    return {
      allowed: false,
      reason: "no_content_link",
      title: "Conteúdo em preparação",
      message:
        "Esta disciplina ainda não possui conteúdo vinculado. A moderação ficará disponível quando houver aulas.",
    }
  }

  return { allowed: true }
}
