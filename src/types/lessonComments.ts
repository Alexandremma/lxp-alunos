import type { TeamRole } from "@/consts/teamRoles"

export type LessonCommentRow = {
  id: string
  student_profile_id: string
  external_discipline_id: string
  external_unit_id: string
  parent_id: string | null
  body: string
  author_team_role: TeamRole | null
  created_at: string
  updated_at?: string
}

export type LessonCommentWithAuthor = LessonCommentRow & {
  author_name: string
  author_avatar_path: string | null
  author_avatar_updated_at: string | null
  author_badge_label: string | null
}
