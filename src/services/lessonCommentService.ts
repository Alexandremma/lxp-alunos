import { supabase } from "@/lib/supabaseClient"

export const LESSON_COMMENT_MAX_LENGTH = 2000

export type LessonCommentRow = {
  id: string
  student_profile_id: string
  external_discipline_id: string
  external_unit_id: string
  parent_id: string | null
  body: string
  created_at: string
  updated_at?: string
}

export type LessonCommentWithAuthor = LessonCommentRow & {
  author_name: string
}

type ProfileNameRow = { id: string; name: string | null }

async function attachAuthorNames(rows: LessonCommentRow[]): Promise<LessonCommentWithAuthor[]> {
  if (rows.length === 0) return []

  const ids = [...new Set(rows.map((r) => r.student_profile_id))]
  const { data: profiles, error } = await supabase
    .from("lxp_profiles")
    .select("id,name")
    .in("id", ids)

  if (error) throw error

  const nameById = new Map<string, string>()
  for (const p of (profiles ?? []) as ProfileNameRow[]) {
    nameById.set(p.id, p.name?.trim() || "Aluno")
  }

  return rows.map((row) => ({
    ...row,
    author_name: nameById.get(row.student_profile_id) ?? "Aluno",
  }))
}

export async function listLessonComments(params: {
  externalDisciplineId: string
  externalUnitId: string
}): Promise<LessonCommentWithAuthor[]> {
  const { data, error } = await supabase
    .from("lxp_lesson_comments")
    .select("id,student_profile_id,external_discipline_id,external_unit_id,parent_id,body,created_at,updated_at")
    .eq("external_discipline_id", params.externalDisciplineId)
    .eq("external_unit_id", params.externalUnitId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return attachAuthorNames((data ?? []) as LessonCommentRow[])
}

export async function createLessonComment(params: {
  studentProfileId: string
  externalDisciplineId: string
  externalUnitId: string
  body: string
  parentId?: string | null
}): Promise<LessonCommentWithAuthor> {
  const trimmed = params.body.trim()
  if (!trimmed) throw new Error("Comentário vazio")
  if (trimmed.length > LESSON_COMMENT_MAX_LENGTH) {
    throw new Error(`Máximo de ${LESSON_COMMENT_MAX_LENGTH} caracteres`)
  }

  const { data, error } = await supabase
    .from("lxp_lesson_comments")
    .insert({
      student_profile_id: params.studentProfileId,
      external_discipline_id: params.externalDisciplineId,
      external_unit_id: params.externalUnitId,
      parent_id: params.parentId ?? null,
      body: trimmed,
    })
    .select("id,student_profile_id,external_discipline_id,external_unit_id,parent_id,body,created_at,updated_at")
    .single()

  if (error) throw error
  const [withAuthor] = await attachAuthorNames([data as LessonCommentRow])
  return withAuthor
}

export async function updateLessonComment(params: {
  commentId: string
  body: string
}): Promise<void> {
  const trimmed = params.body.trim()
  if (!trimmed) throw new Error("Comentário vazio")
  if (trimmed.length > LESSON_COMMENT_MAX_LENGTH) {
    throw new Error(`Máximo de ${LESSON_COMMENT_MAX_LENGTH} caracteres`)
  }

  const { error } = await supabase
    .from("lxp_lesson_comments")
    .update({ body: trimmed, updated_at: new Date().toISOString() })
    .eq("id", params.commentId)

  if (error) throw error
}

export async function deleteLessonComment(commentId: string): Promise<void> {
  const { error } = await supabase.from("lxp_lesson_comments").delete().eq("id", commentId)
  if (error) throw error
}
