import { supabase } from "@/lib/supabaseClient";

export const LESSON_NOTE_MAX_LENGTH = 5000;

export type LessonNoteRow = {
  id: string;
  student_profile_id: string;
  external_discipline_id: string;
  external_unit_id: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export async function listLessonNotes(params: {
  studentProfileId: string;
  externalDisciplineId: string;
  externalUnitId: string;
}): Promise<LessonNoteRow[]> {
  const { data, error } = await supabase
    .from("lxp_lesson_notes")
    .select("id,student_profile_id,external_discipline_id,external_unit_id,body,created_at,updated_at")
    .eq("student_profile_id", params.studentProfileId)
    .eq("external_discipline_id", params.externalDisciplineId)
    .eq("external_unit_id", params.externalUnitId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as LessonNoteRow[];
}

export async function createLessonNote(params: {
  studentProfileId: string;
  externalDisciplineId: string;
  externalUnitId: string;
  body: string;
}): Promise<LessonNoteRow> {
  const trimmed = params.body.trim();
  if (!trimmed) throw new Error("Anotação vazia");
  if (trimmed.length > LESSON_NOTE_MAX_LENGTH) {
    throw new Error(`Máximo de ${LESSON_NOTE_MAX_LENGTH} caracteres`);
  }

  const { data, error } = await supabase
    .from("lxp_lesson_notes")
    .insert({
      student_profile_id: params.studentProfileId,
      external_discipline_id: params.externalDisciplineId,
      external_unit_id: params.externalUnitId,
      body: trimmed,
    })
    .select("id,student_profile_id,external_discipline_id,external_unit_id,body,created_at,updated_at")
    .single();

  if (error) throw error;
  return data as LessonNoteRow;
}

export async function updateLessonNote(params: {
  noteId: string;
  body: string;
}): Promise<void> {
  const trimmed = params.body.trim();
  if (!trimmed) throw new Error("Anotação vazia");
  if (trimmed.length > LESSON_NOTE_MAX_LENGTH) {
    throw new Error(`Máximo de ${LESSON_NOTE_MAX_LENGTH} caracteres`);
  }

  const { error } = await supabase
    .from("lxp_lesson_notes")
    .update({ body: trimmed, updated_at: new Date().toISOString() })
    .eq("id", params.noteId);

  if (error) throw error;
}

export async function deleteLessonNote(noteId: string): Promise<void> {
  const { error } = await supabase.from("lxp_lesson_notes").delete().eq("id", noteId);
  if (error) throw error;
}
