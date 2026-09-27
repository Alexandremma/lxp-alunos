/**
 * Portal do aluno — base para QR e links de validação pública.
 * Production requires VITE_LXP_ALUNOS_PUBLIC_ORIGIN; homolog fallback only in non-PROD.
 */
const HOMOLOG_ALUNOS_ORIGIN = "https://lxp-alunos.vercel.app";

export function getCertificatePublicOrigin(): string {
  const fromEnv = import.meta.env.VITE_LXP_ALUNOS_PUBLIC_ORIGIN?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin.replace(/\/$/, "");
    // QR escaneado no celular não alcança localhost — usar origin real se não for local
    if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
      return origin;
    }
  }

  if (import.meta.env.PROD) {
    throw new Error("VITE_LXP_ALUNOS_PUBLIC_ORIGIN is required in production");
  }
  return HOMOLOG_ALUNOS_ORIGIN;
}

export function buildCertificateValidationUrl(validationCode: string): string {
  const code = validationCode.trim();
  const origin = getCertificatePublicOrigin();
  return `${origin}/validar-certificado?code=${encodeURIComponent(code)}`;
}
