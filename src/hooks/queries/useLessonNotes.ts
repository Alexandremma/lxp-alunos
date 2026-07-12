import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/consts/queryKeys";
import { useAuth } from "@/hooks/use-auth";
import { listLessonNotes } from "@/services/lessonNoteService";

export function useLessonNotes(params: {
  externalDisciplineId: string;
  externalUnitId: string;
  enabled?: boolean;
}) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: queryKeys.lessonNotes.list(
      profile?.id ?? "",
      params.externalDisciplineId,
      params.externalUnitId,
    ),
    queryFn: () => {
      if (!profile?.id) throw new Error("Não autenticado");
      return listLessonNotes({
        studentProfileId: profile.id,
        externalDisciplineId: params.externalDisciplineId,
        externalUnitId: params.externalUnitId,
      });
    },
    enabled:
      params.enabled !== false &&
      !!profile?.id &&
      profile.role === "student" &&
      !!params.externalDisciplineId &&
      !!params.externalUnitId,
  });
}
