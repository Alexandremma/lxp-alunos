const DEFAULT_ALICE_BASE = "https://alice.eadstock.com.br"

/** Extrai origin válida; ignora lixo colado acidentalmente (ex. diálogo do Cursor). */
export function resolveAliceBaseUrl(raw?: string): string {
  const trimmed = raw?.trim()
  if (!trimmed) return DEFAULT_ALICE_BASE

  const embedded = trimmed.match(/https?:\/\/[a-zA-Z0-9.-]+(?::\d+)?/i)
  let candidate = (embedded?.[0] ?? trimmed).replace(/\/+$/, "")

  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate.replace(/^\/+/, "")}`
  }

  try {
    const url = new URL(candidate)
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("invalid protocol")
    }
    return `${url.protocol}//${url.host}`
  } catch {
    console.warn(
      "[alice] VITE_ALICE_BASE_URL inválida; usando padrão.",
      trimmed.length > 120 ? `${trimmed.slice(0, 120)}…` : trimmed,
    )
    return DEFAULT_ALICE_BASE
  }
}
