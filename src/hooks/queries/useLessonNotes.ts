import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { listLessonNotes } from "@/services/lessonNoteService";

export const lessonNoteKeys = {
  list: (profileId: string, disciplineId: string, unitId: string) =>
    ["lesson-notes", profileId, disciplineId, unitId] as const,
};

export function useLessonNotes(params: {
  externalDisciplineId: string;
  externalUnitId: string;
  enabled?: boolean;
}) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: lessonNoteKeys.list(
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
