import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useTeamModeration } from "@/hooks/useTeamModeration";
import { queryKeys } from "@/consts/queryKeys";
import { fireAuditLog } from "@/lib/auditLogHelpers";
import {
  createLessonComment,
  deleteLessonComment,
  updateLessonComment,
} from "@/services/lessonCommentService";
import type { LessonCommentWithAuthor } from "@/types/lessonComments";
import { lessonCommentKeys } from "@/hooks/queries/useLessonComments";

export function useLessonCommentMutations(params: {
  externalDisciplineId: string;
  externalUnitId: string;
}) {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const { isModerator, teamRole, member } = useTeamModeration();
  const listKey = lessonCommentKeys.list(params.externalDisciplineId, params.externalUnitId);

  const invalidateAll = () => {
    void qc.invalidateQueries({ queryKey: listKey });
    if (profile?.id && !isModerator) {
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.stats(profile.id) });
      void qc.invalidateQueries({ queryKey: queryKeys.portfolio.evidences(profile.id) });
    }
  };

  const create = useMutation({
    mutationFn: (input: { body: string; parentId?: string | null }) => {
      if (!profile?.id) throw new Error("Não autenticado");
      return createLessonComment({
        studentProfileId: profile.id,
        externalDisciplineId: params.externalDisciplineId,
        externalUnitId: params.externalUnitId,
        body: input.body,
        parentId: input.parentId,
        authorTeamRole: isModerator ? teamRole : null,
      });
    },
    onSuccess: (created) => {
      invalidateAll();
      if (created.author_team_role) {
        fireAuditLog({
          action: "comment.staff_create",
          entityType: "lxp_lesson_comment",
          entityId: created.id,
          metadata: {
            source: "lxp-alunos",
            author_team_role: created.author_team_role,
            actor_member_name: member?.name,
            external_discipline_id: params.externalDisciplineId,
            external_unit_id: params.externalUnitId,
            parent_id: created.parent_id,
          },
        });
      }
    },
  });

  const update = useMutation({
    mutationFn: (input: { commentId: string; body: string }) =>
      updateLessonComment(input),
    onSuccess: invalidateAll,
  });

  const remove = useMutation({
    mutationFn: async (input: { commentId: string; comment: LessonCommentWithAuthor }) => {
      await deleteLessonComment(input.commentId);
      return input;
    },
    onSuccess: ({ comment }) => {
      invalidateAll();
      const isOwnComment = comment.student_profile_id === profile?.id;
      if (isModerator && !isOwnComment) {
        fireAuditLog({
          action: "comment.moderate_delete",
          entityType: "lxp_lesson_comment",
          entityId: comment.id,
          metadata: {
            source: "lxp-alunos",
            actor_member_name: member?.name,
            actor_team_role: teamRole,
            author_profile_id: comment.student_profile_id,
            author_name: comment.author_name,
            author_team_role: comment.author_team_role,
            external_discipline_id: comment.external_discipline_id,
            external_unit_id: comment.external_unit_id,
            body_preview: comment.body.slice(0, 120),
          },
        });
      }
    },
  });

  return {
    create,
    update,
    remove,
    profileId: profile?.id,
    isModerator,
    canModerateComments: isModerator,
  };
}
