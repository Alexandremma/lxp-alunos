import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryKeys } from "@/consts/queryKeys";
import {
  createLessonComment,
  deleteLessonComment,
  updateLessonComment,
} from "@/services/lessonCommentService";
import { lessonCommentKeys } from "@/hooks/queries/useLessonComments";

export function useLessonCommentMutations(params: {
  externalDisciplineId: string;
  externalUnitId: string;
}) {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const listKey = lessonCommentKeys.list(params.externalDisciplineId, params.externalUnitId);

  const invalidateAll = () => {
    void qc.invalidateQueries({ queryKey: listKey });
    if (profile?.id) {
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
      });
    },
    onSuccess: invalidateAll,
  });

  const update = useMutation({
    mutationFn: (input: { commentId: string; body: string }) =>
      updateLessonComment(input),
    onSuccess: invalidateAll,
  });

  const remove = useMutation({
    mutationFn: (commentId: string) => deleteLessonComment(commentId),
    onSuccess: invalidateAll,
  });

  return { create, update, remove, profileId: profile?.id };
}
