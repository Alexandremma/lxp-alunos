import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/states/LoadingSpinner";
import { LoadingLearning } from "@/components/states/LoadingLearning";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLessonNotes } from "@/hooks/queries/useLessonNotes";
import { useLessonNoteMutations } from "@/hooks/mutations/useLessonNoteMutations";
import { LESSON_NOTE_MAX_LENGTH, type LessonNoteRow } from "@/services/lessonNoteService";
import { toast } from "sonner";

function formatRelativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR });
}

interface LessonNotesPanelProps {
  externalDisciplineId: string;
  externalUnitId: string;
}

export const LessonNotesPanel = ({
  externalDisciplineId,
  externalUnitId,
}: LessonNotesPanelProps) => {
  const notesQ = useLessonNotes({ externalDisciplineId, externalUnitId });
  const { create, update, remove } = useLessonNoteMutations({
    externalDisciplineId,
    externalUnitId,
  });

  const [newBody, setNewBody] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editBody, setEditBody] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const submitNew = async () => {
    if (!newBody.trim()) return;
    try {
      await create.mutateAsync(newBody);
      setNewBody("");
      toast.success("Anotação salva");
    } catch {
      toast.error("Não foi possível salvar a anotação");
    }
  };

  const saveEdit = async () => {
    if (!editingId || !editBody.trim()) return;
    try {
      await update.mutateAsync({ noteId: editingId, body: editBody });
      setEditingId(null);
      setEditBody("");
      toast.success("Anotação atualizada");
    } catch {
      toast.error("Não foi possível atualizar");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      setDeleteId(null);
      if (editingId === deleteId) {
        setEditingId(null);
        setEditBody("");
      }
      toast.success("Anotação removida");
    } catch {
      toast.error("Não foi possível remover");
    }
  };

  const renderNote = (note: LessonNoteRow) => {
    const isEditing = editingId === note.id;
    const wasEdited = note.updated_at !== note.created_at;

    return (
      <div key={note.id} className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(note.created_at)}
            {wasEdited && !isEditing ? " · editada" : ""}
          </span>
          {!isEditing && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1 text-muted-foreground hover:text-primary"
                aria-label="Editar anotação"
                onClick={() => {
                  setEditingId(note.id);
                  setEditBody(note.body);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="p-1 text-muted-foreground hover:text-destructive"
                aria-label="Excluir anotação"
                onClick={() => setDeleteId(note.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <>
            <Textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value.slice(0, LESSON_NOTE_MAX_LENGTH))}
              className="min-h-[96px] text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {editBody.length}/{LESSON_NOTE_MAX_LENGTH}
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => void saveEdit()} disabled={update.isPending}>
                Salvar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingId(null);
                  setEditBody("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{note.body}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Escreva suas anotações aqui..."
          value={newBody}
          onChange={(e) => setNewBody(e.target.value.slice(0, LESSON_NOTE_MAX_LENGTH))}
          className="min-h-[120px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {newBody.length}/{LESSON_NOTE_MAX_LENGTH} · só você vê estas anotações
        </p>
        <Button
          size="sm"
          className="w-full"
          onClick={() => void submitNew()}
          disabled={create.isPending || !newBody.trim()}
        >
          {create.isPending ? (
            <LoadingSpinner size="sm" />
          ) : (
            "Salvar anotação"
          )}
        </Button>
      </div>

      <div className="pt-4 border-t border-border space-y-3">
        {notesQ.isLoading && (
          <LoadingLearning type="list" count={2} className="py-2" />
        )}
        {notesQ.isError && (
          <p className="text-sm text-destructive text-center py-6">
            Não foi possível carregar suas anotações.
          </p>
        )}
        {!notesQ.isLoading && (notesQ.data?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Suas anotações desta aula aparecerão aqui.
          </p>
        )}
        {(notesQ.data ?? []).map(renderNote)}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir anotação?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
