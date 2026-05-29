import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import {
  isStudentEnrollmentBlocked,
  isStudentEnrollmentBlockedByUserId,
  STUDENT_BLOCKED_MESSAGE,
} from "@/services/studentAccessLoginService"

/**
 * Redireciona aluno com todas as matrículas bloqueadas para o login.
 */
export function useStudentAccessGate(profileId: string | undefined, enabled: boolean) {
  const navigate = useNavigate()
  const location = useLocation()
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!enabled || !profileId) return

    let cancelled = false
    setChecking(true)

    void (async () => {
      try {
        const blocked = await isStudentEnrollmentBlocked(profileId)
        if (cancelled || !blocked) return
        await supabase.auth.signOut()
        navigate("/login", {
          replace: true,
          state: { blockedMessage: STUDENT_BLOCKED_MESSAGE },
        })
      } catch (err) {
        console.warn("[useStudentAccessGate]", err)
      } finally {
        if (!cancelled) setChecking(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [enabled, profileId, navigate, location.pathname])

  return { checking }
}

export async function signOutIfEnrollmentBlocked(userId: string): Promise<string | null> {
  const blocked = await isStudentEnrollmentBlockedByUserId(userId)
  if (!blocked) return null
  await supabase.auth.signOut()
  return STUDENT_BLOCKED_MESSAGE
}
