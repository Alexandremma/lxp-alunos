import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import {
  isStudentEnrollmentBlocked,
  isStudentEnrollmentBlockedByUserId,
  STUDENT_BLOCKED_MESSAGE,
} from "@/services/studentAccessLoginService"

/**
 * Redireciona aluno com todas as matrículas bloqueadas para o login.
 * Roda uma vez por perfil na sessão (não bloqueia cada troca de rota).
 */
export function useStudentAccessGate(profileId: string | undefined, enabled: boolean) {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(false)
  const checkedProfileRef = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || !profileId) return
    if (checkedProfileRef.current === profileId) return

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
        if (!cancelled) {
          setChecking(false)
          checkedProfileRef.current = profileId
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [enabled, profileId, navigate])

  return { checking }
}

export async function signOutIfEnrollmentBlocked(userId: string): Promise<string | null> {
  const blocked = await isStudentEnrollmentBlockedByUserId(userId)
  if (!blocked) return null
  await supabase.auth.signOut()
  return STUDENT_BLOCKED_MESSAGE
}
