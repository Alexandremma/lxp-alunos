/** Portal do aluno — base para QR e links de validação pública. Sobrescreva em prod via env. */
const HOMOLOG_ALUNOS_ORIGIN = "https://lxp-alunos.vercel.app"

export function getCertificatePublicOrigin(): string {
  const fromEnv = import.meta.env.VITE_LXP_ALUNOS_PUBLIC_ORIGIN?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, "")
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin.replace(/\/$/, "")
    // QR escaneado no celular não alcança localhost — usar homolog como fallback
    if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
      return origin
    }
  }
  return HOMOLOG_ALUNOS_ORIGIN
}

export function buildCertificateValidationUrl(validationCode: string): string {
  const code = validationCode.trim()
  const origin = getCertificatePublicOrigin()
  return `${origin}/validar-certificado?code=${encodeURIComponent(code)}`
}
