import { supabase } from "@/lib/supabaseClient"

export type LessonCommentRow = {
  id: string
  student_profile_id: string
  external_discipline_id: string
  external_unit_id: string
  parent_id: string | null
  body: string
  created_at: string
}

/**
 * Lista comentários de uma aula (raiz + respostas). UI na Lesson.tsx virá no Passo 4.
 */
export async function listLessonComments(params: {
  externalDisciplineId: string
  externalUnitId: string
}): Promise<LessonCommentRow[]> {
  const { data, error } = await supabase
    .from("lxp_lesson_comments")
    .select("id,student_profile_id,external_discipline_id,external_unit_id,parent_id,body,created_at")
    .eq("external_discipline_id", params.externalDisciplineId)
    .eq("external_unit_id", params.externalUnitId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return (data ?? []) as LessonCommentRow[]
}

/**
 * Novo comentário ou resposta. XP (15 / 30) será concedido via trigger quando Step 19b existir.
 */
export async function createLessonComment(params: {
  studentProfileId: string
  externalDisciplineId: string
  externalUnitId: string
  body: string
  parentId?: string | null
}): Promise<LessonCommentRow> {
  const { data, error } = await supabase
    .from("lxp_lesson_comments")
    .insert({
      student_profile_id: params.studentProfileId,
      external_discipline_id: params.externalDisciplineId,
      external_unit_id: params.externalUnitId,
      parent_id: params.parentId ?? null,
      body: params.body.trim(),
    })
    .select("id,student_profile_id,external_discipline_id,external_unit_id,parent_id,body,created_at")
    .single()

  if (error) throw error
  return data as LessonCommentRow
}
