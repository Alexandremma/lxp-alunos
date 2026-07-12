import { useMutation } from "@tanstack/react-query"
import { signOutIfEnrollmentBlocked } from "@/hooks/useStudentAccessGate"
import {
  resolveStudentPostLoginPath,
  signInStudentSession,
} from "@/services/authSessionService"

export type StudentSignInResult =
  | { status: "ok"; nextPath: string }
  | { status: "error"; message: string }

export function useStudentSignIn() {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string
      password: string
    }): Promise<StudentSignInResult> => {
      const signedIn = await signInStudentSession(email, password)
      if (signedIn.status === "error") return signedIn

      const blockedMessage = await signOutIfEnrollmentBlocked(signedIn.userId)
      if (blockedMessage) {
        return { status: "error", message: blockedMessage }
      }

      const nextPath = await resolveStudentPostLoginPath(signedIn.userId)
      return { status: "ok", nextPath }
    },
  })
}
