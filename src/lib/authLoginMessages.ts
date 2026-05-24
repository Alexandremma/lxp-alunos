import type { AuthError } from "@supabase/supabase-js";

const INVALID_CREDENTIALS =
  "Credenciais inválidas. Verifique seu email e senha.";

function normalize(error: AuthError | null): { code: string; message: string } {
  return {
    code: (error?.code ?? "").toLowerCase(),
    message: (error?.message ?? "").toLowerCase(),
  };
}

export function isLikelyNetworkError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error ? String((error as { message: unknown }).message).toLowerCase() : "";
  return (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("load failed")
  );
}

export function mapSignInErrorMessage(error: AuthError | null): string {
  if (!error) {
    return "Não foi possível entrar. Verifique sua conexão e tente novamente.";
  }

  const { code, message } = normalize(error);

  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada ou solicite um novo convite.";
  }
  if (code === "too_many_requests" || message.includes("rate limit")) {
    return "Muitas tentativas em sequência. Aguarde alguns minutos e tente novamente.";
  }
  if (
    code === "invalid_credentials" ||
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return INVALID_CREDENTIALS;
  }
  if (message.includes("fetch") || message.includes("network") || code === "unexpected_failure") {
    return "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";
  }

  return INVALID_CREDENTIALS;
}

export function mapResetPasswordErrorMessage(error: AuthError | null): string {
  if (!error) {
    return "Não foi possível enviar o e-mail. Tente novamente ou fale com o suporte.";
  }

  const { code, message } = normalize(error);

  if (code === "too_many_requests" || message.includes("rate limit")) {
    return "Muitas solicitações em sequência. Aguarde alguns minutos e tente novamente.";
  }
  if (message.includes("fetch") || message.includes("network")) {
    return "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";
  }

  return "Não foi possível enviar o e-mail. Tente novamente ou fale com o suporte.";
}
