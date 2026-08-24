/**
 * Cliente do Tutor IA — chama a Edge `ai-tutor-chat` (proxy MAIA).
 * A API key nunca fica no browser.
 */

import { supabase } from "@/lib/supabaseClient"

export type TutorChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

export type TutorStreamHandlers = {
  onMeta?: (conversationId: string) => void
  onToken?: (delta: string) => void
  onDone?: (meta: Record<string, unknown>) => void
  onError?: (message: string) => void
}

type HistoryResponse = {
  conversation_id?: string
  messages?: Array<{
    role?: string
    content?: string
    created_at?: string
  }>
}

function functionsBaseUrl(): string {
  const base = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "")
  if (!base) throw new Error("VITE_SUPABASE_URL não configurada.")
  return `${base}/functions/v1/ai-tutor-chat`
}

async function authHeaders(): Promise<HeadersInit> {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session?.access_token) {
    throw new Error("Faça login para usar o Tutor IA.")
  }
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""
  return {
    Authorization: `Bearer ${data.session.access_token}`,
    apikey: anon,
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  }
}

function parseSseBlock(raw: string): { event: string; data: unknown } | null {
  const lines = raw.split("\n")
  const eventLine = lines.find((l) => l.startsWith("event:")) ?? ""
  const dataLine = lines.find((l) => l.startsWith("data:")) ?? ""
  const event = eventLine.replace(/^event:\s?/, "").trim()
  const dataRaw = dataLine.replace(/^data:\s?/, "").trim()
  if (!event || !dataRaw) return null
  try {
    return { event, data: JSON.parse(dataRaw) as unknown }
  } catch {
    return { event, data: { message: dataRaw } }
  }
}

/** Stream de chat; retorna o conversation_id capturado (se houver). */
export async function streamTutorChat(
  params: {
    question: string
    rentHash: string
    conversationId?: string | null
    signal?: AbortSignal
  },
  handlers: TutorStreamHandlers,
): Promise<string | null> {
  const headers = await authHeaders()
  const body: Record<string, string> = {
    question: params.question,
    rent_hash: params.rentHash,
  }
  if (params.conversationId?.trim()) {
    body.conversation_id = params.conversationId.trim()
  }

  const res = await fetch(functionsBaseUrl(), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: params.signal,
  })

  if (!res.ok) {
    let message = `Tutor indisponível (${res.status}).`
    try {
      const err = (await res.json()) as { message?: string }
      if (err.message) message = err.message
    } catch {
      /* ignore */
    }
    handlers.onError?.(message)
    throw new Error(message)
  }

  if (!res.body) {
    const message = "Resposta vazia do tutor."
    handlers.onError?.(message)
    throw new Error(message)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let conversationId: string | null = params.conversationId?.trim() || null

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let sep: number
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)
      const parsed = parseSseBlock(raw)
      if (!parsed) continue

      const data = parsed.data as Record<string, unknown>
      if (parsed.event === "meta") {
        const id =
          typeof data.conversation_id === "string"
            ? data.conversation_id
            : null
        if (id) {
          conversationId = id
          handlers.onMeta?.(id)
        }
      } else if (parsed.event === "token") {
        const delta = typeof data.delta === "string" ? data.delta : ""
        if (delta) handlers.onToken?.(delta)
      } else if (parsed.event === "done") {
        handlers.onDone?.(data)
      } else if (parsed.event === "error") {
        const message =
          typeof data.message === "string"
            ? data.message
            : "Erro no tutor."
        handlers.onError?.(message)
      }
    }
  }

  return conversationId
}

export async function fetchTutorHistory(
  conversationId: string,
  limit = 40,
): Promise<TutorChatMessage[]> {
  const headers = await authHeaders()
  const url = new URL(functionsBaseUrl())
  url.searchParams.set("conversation_id", conversationId)
  url.searchParams.set("limit", String(limit))

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      ...headers,
      Accept: "application/json",
    },
  })

  if (!res.ok) {
    throw new Error(`Não foi possível carregar o histórico (${res.status}).`)
  }

  const json = (await res.json()) as HistoryResponse
  const rows = Array.isArray(json.messages) ? json.messages : []
  return rows
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim(),
    )
    .map((m, index) => ({
      id: `hist-${index}-${m.created_at ?? index}`,
      role: m.role as "user" | "assistant",
      content: (m.content as string).trim(),
    }))
}

export function tutorConversationStorageKey(
  userId: string,
  rentHash: string,
): string {
  return `lxp-ai-tutor:${userId}:${rentHash}`
}

export const TUTOR_QUICK_PROMPTS: Record<string, string> = {
  resumo:
    "Faça um resumo claro e objetivo desta aula com base no material do e-book.",
  quiz:
    "Crie um quiz curto (3 a 5 perguntas de múltipla escolha) sobre o conteúdo desta aula, com gabarito ao final.",
  flashcards:
    "Gere flashcards de revisão (pergunta e resposta) sobre os pontos principais desta aula.",
  exemplos:
    "Dê exemplos práticos e do dia a dia relacionados ao conteúdo desta aula.",
}
