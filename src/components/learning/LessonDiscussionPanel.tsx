import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Award, Pencil, Reply, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/states/LoadingSpinner";
import { LoadingLearning } from "@/components/states/LoadingLearning";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useLessonComments } from "@/hooks/queries/useLessonComments";
import { useLessonCommentMutations } from "@/hooks/mutations/useLessonCommentMutations";
import {
  LESSON_COMMENT_MAX_LENGTH,
  type LessonCommentWithAuthor,
} from "@/services/lessonCommentService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useXpRules } from "@/hooks/queries/useXpRules";
import {
  getLessonCommentReplyXp,
  getLessonCommentXp,
} from "@/services/gamificationXpRulesService";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatRelativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR });
}

type Thread = {
  root: LessonCommentWithAuthor;
  replies: LessonCommentWithAuthor[];
};

function buildThreads(comments: LessonCommentWithAuthor[]): Thread[] {
  const roots = comments.filter((c) => !c.parent_id);
  const byParent = new Map<string, LessonCommentWithAuthor[]>();
  for (const c of comments) {
    if (!c.parent_id) continue;
    const list = byParent.get(c.parent_id) ?? [];
    list.push(c);
    byParent.set(c.parent_id, list);
  }
  return roots.map((root) => ({
    root,
    replies: (byParent.get(root.id) ?? []).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    ),
  }));
}

interface LessonDiscussionPanelProps {
  externalDisciplineId: string;
  externalUnitId: string;
}

export const LessonDiscussionPanel = ({
  externalDisciplineId,
  externalUnitId,
}: LessonDiscussionPanelProps) => {
  const commentsQ = useLessonComments({ externalDisciplineId, externalUnitId });
  const { data: xpRules } = useXpRules();
  const commentXp = xpRules ? getLessonCommentXp(xpRules) : null;
  const replyXp = xpRules ? getLessonCommentReplyXp(xpRules) : null;
  const { create, update, remove, profileId, isModerator, canModerateComments } =
    useLessonCommentMutations({
      externalDisciplineId,
      externalUnitId,
    });

  const [newBody, setNewBody] = React.useState("");
  const [replyToId, setReplyToId] = React.useState<string | null>(null);
  const [replyBody, setReplyBody] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editBody, setEditBody] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<LessonCommentWithAuthor | null>(null);

  const threads = React.useMemo(
    () => buildThreads(commentsQ.data ?? []),
    [commentsQ.data],
  );

  const submitRoot = async () => {
    if (!newBody.trim()) return;
    try {
      await create.mutateAsync({ body: newBody });
      setNewBody("");
      toast.success("Comentário publicado");
    } catch {
      toast.error("Não foi possível publicar o comentário");
    }
  };

  const submitReply = async () => {
    if (!replyToId || !replyBody.trim()) return;
    try {
      await create.mutateAsync({ body: replyBody, parentId: replyToId });
      setReplyBody("");
      setReplyToId(null);
      toast.success("Resposta publicada");
    } catch {
      toast.error("Não foi possível publicar a resposta");
    }
  };

  const saveEdit = async () => {
    if (!editingId || !editBody.trim()) return;
    try {
      await update.mutateAsync({ commentId: editingId, body: editBody });
      setEditingId(null);
      setEditBody("");
      toast.success("Comentário atualizado");
    } catch {
      toast.error("Não foi possível atualizar");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync({ commentId: deleteTarget.id, comment: deleteTarget });
      setDeleteTarget(null);
      toast.success("Comentário removido");
    } catch {
      toast.error("Não foi possível remover");
    }
  };

  const canEditComment = (comment: LessonCommentWithAuthor) =>
    !!profileId && comment.student_profile_id === profileId;

  const canDeleteComment = (comment: LessonCommentWithAuthor) => {
    if (!profileId) return false;
    if (comment.student_profile_id === profileId) return true;
    return canModerateComments;
  };

  const renderActions = (comment: LessonCommentWithAuthor, isEditing: boolean) => {
    const showEdit = canEditComment(comment);
    const showDelete = canDeleteComment(comment);
    if (!showEdit && !showDelete) return null;

    if (isEditing) {
      return (
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="default" onClick={() => void saveEdit()} disabled={update.isPending}>
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
      );
    }

    return (
      <div className="flex items-center gap-2 mt-2">
        {showEdit && (
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            onClick={() => {
              setEditingId(comment.id);
              setEditBody(comment.body);
              setReplyToId(null);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </button>
        )}
        {showDelete && (
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteTarget(comment)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Excluir
          </button>
        )}
      </div>
    );
  };

  const renderComment = (
    comment: LessonCommentWithAuthor,
    compact?: boolean,
  ) => {
    const isEditing = editingId === comment.id;
    const isStaffComment = !!comment.author_badge_label;

    return (
      <div className={cn("flex items-start gap-3", compact && "gap-2")}>
        <Avatar className={cn("shrink-0", compact ? "h-7 w-7" : "h-8 w-8")}>
          <AvatarFallback
            className={cn(
              "text-xs",
              isStaffComment
                ? "bg-secondary/20 text-secondary-foreground"
                : "bg-primary/10 text-primary",
            )}
          >
            {initialsFromName(comment.author_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">{comment.author_name}</span>
            {comment.author_badge_label ? (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                {comment.author_badge_label}
              </Badge>
            ) : null}
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>
          {isEditing ? (
            <>
              <Textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value.slice(0, LESSON_COMMENT_MAX_LENGTH))}
                className="mt-2 min-h-[72px] text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {editBody.length}/{LESSON_COMMENT_MAX_LENGTH}
              </p>
            </>
          ) : (
            <p className="text-sm text-foreground/90 mt-1 leading-relaxed whitespace-pre-wrap">
              {comment.body}
            </p>
          )}
          {renderActions(comment, isEditing)}
          {!isEditing && !comment.parent_id && replyToId !== comment.id && (
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-2"
              onClick={() => {
                setReplyToId(comment.id);
                setReplyBody("");
                setEditingId(null);
              }}
            >
              <Reply className="h-3.5 w-3.5" />
              Responder
            </button>
          )}
          {replyToId === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Escreva sua resposta..."
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value.slice(0, LESSON_COMMENT_MAX_LENGTH))}
                className="min-h-[72px] text-sm resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {replyBody.length}/{LESSON_COMMENT_MAX_LENGTH}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={() => void submitReply()} disabled={create.isPending}>
                  Publicar resposta
                </Button>
                {!isModerator && replyXp != null && replyXp > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    +{replyXp} XP
                  </span>
                )}
                <Button size="sm" variant="ghost" onClick={() => setReplyToId(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder={
          isModerator
            ? "Escreva um comentário como membro da equipe..."
            : "Faça uma pergunta ou comentário..."
        }
        value={newBody}
        onChange={(e) => setNewBody(e.target.value.slice(0, LESSON_COMMENT_MAX_LENGTH))}
        className="min-h-[80px] resize-none"
      />
      <div className="flex items-center justify-between gap-2 -mt-2">
        <p className="text-xs text-muted-foreground">
          {newBody.length}/{LESSON_COMMENT_MAX_LENGTH}
        </p>
        {!isModerator && commentXp != null && commentXp > 0 && (
          <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
            <Award className="h-3.5 w-3.5" />
            +{commentXp} XP ao comentar
          </span>
        )}
      </div>
      <Button
        size="sm"
        className="w-full"
        onClick={() => void submitRoot()}
        disabled={create.isPending || !newBody.trim()}
      >
        {create.isPending ? <LoadingSpinner size="sm" /> : "Enviar comentário"}
      </Button>

      <div className="pt-4 border-t border-border space-y-4">
        {commentsQ.isLoading && (
          <LoadingLearning type="list" count={3} className="py-2" />
        )}
        {commentsQ.isError && (
          <p className="text-sm text-destructive text-center py-6">
            Não foi possível carregar os comentários.
          </p>
        )}
        {!commentsQ.isLoading && threads.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Seja o primeiro a comentar nesta aula.
          </p>
        )}
        {threads.map(({ root, replies }) => (
          <div key={root.id} className="space-y-3">
            {renderComment(root)}
            {replies.length > 0 && (
              <div className="ml-8 pl-3 border-l-2 border-border space-y-3">
                {replies.map((reply) => (
                  <div key={reply.id}>{renderComment(reply, true)}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir comentário?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && deleteTarget.student_profile_id !== profileId
                ? "Você está removendo o comentário de outra pessoa. Esta ação não pode ser desfeita e ficará registrada na auditoria."
                : "Esta ação não pode ser desfeita. Respostas vinculadas também serão removidas."}
            </AlertDialogDescription>
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
