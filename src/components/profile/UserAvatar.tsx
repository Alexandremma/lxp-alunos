import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserAvatarPublicUrl } from "@/services/avatarService";
import { cn } from "@/lib/utils";

export function initialsFromDisplayName(name: string | null | undefined): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

type UserAvatarProps = {
  name?: string | null;
  avatarPath?: string | null;
  updatedAt?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
};

export function UserAvatar({
  name,
  avatarPath,
  updatedAt,
  className,
  imageClassName,
  fallbackClassName,
}: UserAvatarProps) {
  const src = getUserAvatarPublicUrl(avatarPath, updatedAt);
  const initials = initialsFromDisplayName(name);
  const alt = name?.trim() || "Avatar";

  return (
    <Avatar className={className}>
      {src ? <AvatarImage src={src} alt={alt} className={imageClassName} /> : null}
      <AvatarFallback className={cn(fallbackClassName)}>{initials}</AvatarFallback>
    </Avatar>
  );
}
