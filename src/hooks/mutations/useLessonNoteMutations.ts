import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  createLessonNote,
  deleteLessonNote,
  updateLessonNote,
} from "@/services/lessonNoteService";
import { lessonNoteKeys } from "@/hooks/queries/useLessonNotes";

export function useLessonNoteMutations(params: {
  externalDisciplineId: string;
  externalUnitId: string;
}) {
  const qc = useQueryClient();
  const { profile } = useAuth();

  const invalidate = () => {
    if (!profile?.id) return;
    void qc.invalidateQueries({
      queryKey: lessonNoteKeys.list(
        profile.id,
        params.externalDisciplineId,
        params.externalUnitId,
      ),
    });
  };

  const create = useMutation({
    mutationFn: (body: string) => {
      if (!profile?.id) throw new Error("Não autenticado");
      return createLessonNote({
        studentProfileId: profile.id,
        externalDisciplineId: params.externalDisciplineId,
        externalUnitId: params.externalUnitId,
        body,
      });
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (input: { noteId: string; body: string }) => updateLessonNote(input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (noteId: string) => deleteLessonNote(noteId),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
