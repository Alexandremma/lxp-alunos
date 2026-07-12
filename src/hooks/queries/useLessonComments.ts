import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/consts/queryKeys";
import { listLessonComments } from "@/services/lessonCommentService";

export function useLessonComments(params: {
  externalDisciplineId: string;
  externalUnitId: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.lessonComments.list(params.externalDisciplineId, params.externalUnitId),
    queryFn: () =>
      listLessonComments({
        externalDisciplineId: params.externalDisciplineId,
        externalUnitId: params.externalUnitId,
      }),
    enabled: params.enabled !== false && !!params.externalDisciplineId && !!params.externalUnitId,
  });
}
