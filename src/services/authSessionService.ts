import type { Session, User, AuthError } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabaseClient"
import {
  isLikelyNetworkError,
  mapResetPasswordErrorMessage,
  mapSignInErrorMessage,
} from "@/lib/authLoginMessages"
import { lxpAlunosSetPasswordUrl } from "@/lib/authRedirectUrls"
import { resolvePostLoginPath } from "@/lib/authRouting"

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ session: Session | null; error: AuthError | null }> {
  const {
    data: { session },
    error,
  } = await supabase.auth.signInWithPassword({ email, password })
  return { session, error }
}

/** Garante linha em `lxp_profiles` para o usuário Auth (aluno). */
export async function ensureStudentProfile(user: User): Promise<string | null> {
  const { data: existingProfile, error: profileError } = await supabase
    .from("lxp_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (profileError) {
    console.warn("[authSession] Erro ao carregar perfil:", profileError.message)
    return null
  }

  if (existingProfile) {
    return existingProfile.id as string
  }

  const { data: inserted, error: insertError } = await supabase
    .from("lxp_profiles")
    .insert({
      user_id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name ?? user.email,
      role: "student",
    })
    .select("id")
    .maybeSingle()

  if (insertError) {
    console.warn("[authSession] Erro ao criar perfil:", insertError.message)
    return null
  }

  return inserted?.id ?? null
}

export type SignInStudentSessionResult =
  | { status: "ok"; userId: string }
  | { status: "error"; message: string }

/** Auth + ensure profile. Bloqueio de matrícula e rota ficam no mutation/page. */
export async function signInStudentSession(
  email: string,
  password: string,
): Promise<SignInStudentSessionResult> {
  try {
    const { session, error: signInError } = await signInWithPassword(email, password)

    if (signInError || !session) {
      return { status: "error", message: mapSignInErrorMessage(signInError) }
    }

    await ensureStudentProfile(session.user)
    return { status: "ok", userId: session.user.id }
  } catch (err) {
    return {
      status: "error",
      message: isLikelyNetworkError(err)
        ? "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente."
        : "Não foi possível entrar. Tente novamente em instantes.",
    }
  }
}

export async function resolveStudentPostLoginPath(userId: string): Promise<string> {
  return resolvePostLoginPath(userId)
}

export type RequestPasswordResetResult =
  | { status: "ok" }
  | { status: "error"; message: string }

export async function requestPasswordReset(email: string): Promise<RequestPasswordResetResult> {
  try {
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: lxpAlunosSetPasswordUrl,
    })
    if (resetErr) {
      return { status: "error", message: mapResetPasswordErrorMessage(resetErr) }
    }
    return { status: "ok" }
  } catch (err) {
    return {
      status: "error",
      message: isLikelyNetworkError(err)
        ? "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente."
        : "Não foi possível enviar o e-mail. Tente novamente ou fale com o suporte.",
    }
  }
}

export type SetPasswordResult =
  | { status: "ok" }
  | { status: "error"; message: string }

export async function setPasswordAndSignOut(password: string): Promise<SetPasswordResult> {
  const { error: updateError } = await supabase.auth.updateUser({ password })
  if (updateError) {
    return {
      status: "error",
      message: "Não foi possível definir a senha. Solicite um novo link e tente novamente.",
    }
  }

  await supabase.auth.signOut()
  return { status: "ok" }
}
