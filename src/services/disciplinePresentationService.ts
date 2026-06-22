import { supabase } from "@/lib/supabaseClient"

const COVERS_BUCKET = "discipline-covers"

const DISCIPLINE_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type DisciplinePresentation = {
  /** Texto abaixo do título: descrição da disciplina ou, se vazia, do curso. */
  subtitle: string | null
  coverImageUrl: string | null
}

export function getDisciplineCoverPublicUrl(path: string | null | undefined): string | null {
  if (!path?.trim()) return null
  const { data } = supabase.storage.from(COVERS_BUCKET).getPublicUrl(path.trim())
  return data.publicUrl || null
}

export async function getDisciplineWorkload(disciplineId: string): Promise<number | null> {
  if (!DISCIPLINE_UUID_RE.test(disciplineId)) return null

  const { data, error } = await supabase
    .from("lxp_course_disciplines")
    .select("workload")
    .eq("id", disciplineId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return typeof data.workload === "number" ? data.workload : null
}

/**
 * Metadados de apresentação da disciplina no LXP (não expõe detalhes de integração).
 * Subtítulo: description da disciplina → description do curso → null.
 */
export async function getDisciplinePresentation(
  disciplineId: string,
): Promise<DisciplinePresentation | null> {
  if (!DISCIPLINE_UUID_RE.test(disciplineId)) return null

  const { data, error } = await supabase
    .from("lxp_course_disciplines")
    .select("description, cover_image_path, lxp_course_periods(lxp_courses(description))")
    .eq("id", disciplineId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const periodRow = data.lxp_course_periods as
    | { lxp_courses?: { description?: string | null } | null }
    | null
  const courseDescription = periodRow?.lxp_courses?.description?.trim() || null
  const disciplineDescription = (data.description as string | null)?.trim() || null

  return {
    subtitle: disciplineDescription || courseDescription || null,
    coverImageUrl: getDisciplineCoverPublicUrl(data.cover_image_path as string | null),
  }
}
