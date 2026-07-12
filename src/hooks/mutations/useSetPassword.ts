import { useMutation } from "@tanstack/react-query"
import { setPasswordAndSignOut } from "@/services/authSessionService"

export function useSetPassword() {
  return useMutation({
    mutationFn: (password: string) => setPasswordAndSignOut(password),
  })
}
