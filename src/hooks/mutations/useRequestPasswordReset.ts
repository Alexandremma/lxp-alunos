import { useMutation } from "@tanstack/react-query"
import { requestPasswordReset } from "@/services/authSessionService"

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  })
}
