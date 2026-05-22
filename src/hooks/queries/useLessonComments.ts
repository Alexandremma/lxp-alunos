import { useQuery } from "@tanstack/react-query";
import { listLessonComments } from "@/services/lessonCommentService";

export const lessonCommentKeys = {
  list: (disciplineId: string, unitId: string) =>
    ["lesson-comments", disciplineId, unitId] as const,
};

export function useLessonComments(params: {
  externalDisciplineId: string;
  externalUnitId: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: lessonCommentKeys.list(params.externalDisciplineId, params.externalUnitId),
    queryFn: () =>
      listLessonComments({
        externalDisciplineId: params.externalDisciplineId,
        externalUnitId: params.externalUnitId,
      }),
    enabled: params.enabled !== false && !!params.externalDisciplineId && !!params.externalUnitId,
  });
}
