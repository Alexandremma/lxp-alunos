import { supabase } from "@/lib/supabaseClient";
import { formatTeamRoleLabel } from "@/consts/teamRoles";
import type { TeamRole } from "@/consts/teamRoles";
import type { LessonCommentRow, LessonCommentWithAuthor } from "@/types/lessonComments";

export const LESSON_COMMENT_MAX_LENGTH = 2000;

export type { LessonCommentRow, LessonCommentWithAuthor } from "@/types/lessonComments";

type ProfileDisplayRow = {
  id: string;
  name: string | null;
  avatar_path: string | null;
  updated_at: string;
};

const PROFILE_DISPLAY_BATCH_SIZE = 50;

async function fetchProfileDisplay(profileIds: string[]): Promise<ProfileDisplayRow[]> {
  const uniqueIds = [...new Set(profileIds)];
  if (uniqueIds.length === 0) return [];

  const rows: ProfileDisplayRow[] = [];
  for (let index = 0; index < uniqueIds.length; index += PROFILE_DISPLAY_BATCH_SIZE) {
    const chunk = uniqueIds.slice(index, index + PROFILE_DISPLAY_BATCH_SIZE);
    const { data, error } = await supabase.rpc("lxp_get_profile_display", {
      p_profile_ids: chunk,
    });
    if (error) throw error;
    rows.push(...((data ?? []) as ProfileDisplayRow[]));
  }

  return rows;
}

async function attachAuthorDisplay(rows: LessonCommentRow[]): Promise<LessonCommentWithAuthor[]> {
  if (rows.length === 0) return [];

  const profiles = await fetchProfileDisplay(rows.map((row) => row.student_profile_id));

  const displayById = new Map<string, ProfileDisplayRow>();
  for (const profile of profiles) {
    displayById.set(profile.id, profile);
  }

  return rows.map((row) => {
    const display = displayById.get(row.student_profile_id);
    return {
      ...row,
      author_name: display?.name?.trim() || "Aluno",
      author_avatar_path: display?.avatar_path ?? null,
      author_avatar_updated_at: display?.updated_at ?? null,
      author_badge_label: row.author_team_role
        ? formatTeamRoleLabel(row.author_team_role)
        : null,
    };
  });
}

const COMMENT_SELECT =
  "id,student_profile_id,external_discipline_id,external_unit_id,parent_id,body,author_team_role,created_at,updated_at";

export async function listLessonComments(params: {
  externalDisciplineId: string;
  externalUnitId: string;
}): Promise<LessonCommentWithAuthor[]> {
  const { data, error } = await supabase
    .from("lxp_lesson_comments")
    .select(COMMENT_SELECT)
    .eq("external_discipline_id", params.externalDisciplineId)
    .eq("external_unit_id", params.externalUnitId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return attachAuthorDisplay((data ?? []) as LessonCommentRow[]);
}

export async function createLessonComment(params: {
  studentProfileId: string;
  externalDisciplineId: string;
  externalUnitId: string;
  body: string;
  parentId?: string | null;
  authorTeamRole?: TeamRole | null;
}): Promise<LessonCommentWithAuthor> {
  const trimmed = params.body.trim();
  if (!trimmed) throw new Error("Comentário vazio");
  if (trimmed.length > LESSON_COMMENT_MAX_LENGTH) {
    throw new Error(`Máximo de ${LESSON_COMMENT_MAX_LENGTH} caracteres`);
  }

  const { data, error } = await supabase
    .from("lxp_lesson_comments")
    .insert({
      student_profile_id: params.studentProfileId,
      external_discipline_id: params.externalDisciplineId,
      external_unit_id: params.externalUnitId,
      parent_id: params.parentId ?? null,
      body: trimmed,
      author_team_role: params.authorTeamRole ?? null,
    })
    .select(COMMENT_SELECT)
    .single();

  if (error) throw error;
  const [withAuthor] = await attachAuthorDisplay([data as LessonCommentRow]);
  return withAuthor;
}

export async function updateLessonComment(params: {
  commentId: string;
  body: string;
}): Promise<void> {
  const trimmed = params.body.trim();
  if (!trimmed) throw new Error("Comentário vazio");
  if (trimmed.length > LESSON_COMMENT_MAX_LENGTH) {
    throw new Error(`Máximo de ${LESSON_COMMENT_MAX_LENGTH} caracteres`);
  }

  const { error } = await supabase
    .from("lxp_lesson_comments")
    .update({ body: trimmed, updated_at: new Date().toISOString() })
    .eq("id", params.commentId);

  if (error) throw error;
}

export async function deleteLessonComment(commentId: string): Promise<void> {
  const { error } = await supabase.from("lxp_lesson_comments").delete().eq("id", commentId);
  if (error) throw error;
}
