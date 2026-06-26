import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { uploadUserAvatar } from "@/services/avatarService";

export function useUploadAvatar() {
  const { user, profile, refetchProfile } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Usuário não autenticado.");
      return uploadUserAvatar(user.id, file, profile?.avatar_path);
    },
    onSuccess: async () => {
      await refetchProfile();
    },
  });
}
