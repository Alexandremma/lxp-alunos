import { useRef } from "react";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { LoadingSpinner } from "@/components/states/LoadingSpinner";
import { useRemoveAvatar } from "@/hooks/mutations/useRemoveAvatar";
import { useUploadAvatar } from "@/hooks/mutations/useUploadAvatar";
import { cn } from "@/lib/utils";

type AvatarUploadFieldProps = {
  name?: string | null;
  email?: string | null;
  genericLabel?: string;
  avatarPath?: string | null;
  updatedAt?: string | null;
  disabled?: boolean;
  avatarClassName?: string;
  fallbackClassName?: string;
};

export function AvatarUploadField({
  name,
  email,
  genericLabel,
  avatarPath,
  updatedAt,
  disabled = false,
  avatarClassName,
  fallbackClassName,
}: AvatarUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  const isBusy = uploadAvatar.isPending || removeAvatar.isPending;
  const canEdit = !disabled && !isBusy;

  const handleFileChange = async (file: File | undefined) => {
    if (!file || disabled) return;

    try {
      await uploadAvatar.mutateAsync(file);
      toast.success("Foto atualizada.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao enviar a foto.";
      toast.error(message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (disabled || !avatarPath) return;

    try {
      await removeAvatar.mutateAsync();
      toast.success("Foto removida.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao remover a foto.";
      toast.error(message);
    }
  };

  return (
    <div className="group relative shrink-0">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        disabled={disabled || isBusy}
        onChange={(event) => void handleFileChange(event.target.files?.[0])}
      />

      <button
        type="button"
        disabled={disabled || isBusy}
        title={disabled ? "Clique em Editar para alterar a foto" : "Alterar foto"}
        aria-label={disabled ? "Foto de perfil" : "Alterar foto de perfil"}
        onClick={() => {
          if (canEdit) fileInputRef.current?.click();
        }}
        className={cn(
          "relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          canEdit ? "cursor-pointer" : "cursor-default",
        )}
      >
        <UserAvatar
          name={name}
          email={email}
          genericLabel={genericLabel}
          avatarPath={avatarPath}
          updatedAt={updatedAt}
          className={cn("h-16 w-16", avatarClassName)}
          fallbackClassName={cn("text-lg", fallbackClassName)}
        />

        {canEdit ? (
          <span
            aria-hidden
            className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            <Camera className="h-5 w-5" />
            <span className="mt-0.5 text-[10px] font-medium leading-none">Alterar</span>
          </span>
        ) : null}

        {isBusy ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 text-white">
            <LoadingSpinner size="sm" className="text-white" />
          </span>
        ) : null}
      </button>

      {canEdit && avatarPath ? (
        <button
          type="button"
          aria-label="Remover foto"
          title="Remover foto"
          onClick={() => void handleRemove()}
          className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-destructive text-destructive-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-destructive/90 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  );
}
