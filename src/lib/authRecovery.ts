import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export function getAuthErrorMessageFromHash(): string | null {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const errorCode = params.get("error_code");
  if (!errorCode) return null;

  if (errorCode === "otp_expired") {
    return "Este link expirou ou já foi usado. Solicite um novo e-mail de redefinição.";
  }

  const description = params.get("error_description");
  if (description) return decodeURIComponent(description.replace(/\+/g, " "));
  return "Não foi possível validar este link de acesso.";
}

function hasRecoveryTokensInUrl(): boolean {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  if (hash) {
    const hp = new URLSearchParams(hash);
    if (hp.get("access_token") || hp.get("type") === "recovery") return true;
  }
  const qp = new URLSearchParams(window.location.search);
  return Boolean(qp.get("code"));
}

export type PasswordRecoveryState =
  | { status: "loading" }
  | { status: "ready"; session: Session }
  | { status: "invalid_link"; message: string }
  | { status: "hash_error"; message: string };

/**
 * Aguarda o Supabase trocar o link do e-mail por sessão (PKCE / hash).
 * Usado em /definir-senha antes de permitir updateUser({ password }).
 */
export function usePasswordRecoverySession(): PasswordRecoveryState {
  const hashError = useMemo(() => getAuthErrorMessageFromHash(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (hashError) return;

    let cancelled = false;

    const apply = (next: Session | null) => {
      if (!cancelled && next) setSession(next);
    };

    void supabase.auth.getSession().then(({ data }) => apply(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      apply(nextSession);
    });

    const timer = window.setTimeout(() => setTimedOut(true), 8000);

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, [hashError]);

  if (hashError) {
    return { status: "hash_error", message: hashError };
  }

  if (session) {
    return { status: "ready", session };
  }

  if (!timedOut) {
    return { status: "loading" };
  }

  return {
    status: "invalid_link",
    message: hasRecoveryTokensInUrl()
      ? "Não foi possível validar o link. Solicite um novo e-mail em “Esqueci minha senha”."
      : "Abra o link completo enviado por e-mail. Se expirou, volte ao login e solicite um novo.",
  };
}
