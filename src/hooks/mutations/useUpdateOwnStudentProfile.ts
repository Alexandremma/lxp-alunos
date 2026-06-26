import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  updateOwnStudentProfile,
  type UpdateOwnStudentProfileInput,
} from "@/services/studentProfileService";

export function useUpdateOwnStudentProfile() {
  const { user, refetchProfile } = useAuth();

  return useMutation({
    mutationFn: async (input: UpdateOwnStudentProfileInput) => {
      if (!user) throw new Error("Usuário não autenticado.");
      await updateOwnStudentProfile(user.id, input);
    },
    onSuccess: async () => {
      await refetchProfile();
    },
  });
}
