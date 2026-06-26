import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initialsForUserAvatar, USER_AVATAR_FALLBACK_CLASS } from "@/lib/avatarDisplay";
import { getUserAvatarPublicUrl } from "@/services/avatarService";
import { cn } from "@/lib/utils";

export { initialsFromDisplay, initialsForUserAvatar } from "@/lib/avatarDisplay";

type UserAvatarProps = {
  name?: string | null;
  email?: string | null;
  genericLabel?: string;
  avatarPath?: string | null;
  updatedAt?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
};

export function UserAvatar({
  name,
  email,
  genericLabel,
  avatarPath,
  updatedAt,
  className,
  imageClassName,
  fallbackClassName,
}: UserAvatarProps) {
  const src = getUserAvatarPublicUrl(avatarPath, updatedAt);
  const initials = initialsForUserAvatar({ name, email, genericLabel });
  const alt = name?.trim() || email?.trim() || "Avatar";

  return (
    <Avatar className={className}>
      {src ? <AvatarImage src={src} alt={alt} className={imageClassName} /> : null}
      <AvatarFallback className={cn(USER_AVATAR_FALLBACK_CLASS, fallbackClassName)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
