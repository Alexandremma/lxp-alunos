import { useCallback, useEffect, useRef, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import {
  fetchTutorHistory,
  streamTutorChat,
  tutorConversationStorageKey,
  type TutorChatMessage,
  TUTOR_QUICK_PROMPTS,
} from "@/services/aiTutorService"

const WELCOME: TutorChatMessage = {
  id: "welcome",
  role: "assistant",
  content: `Olá! Sou seu tutor de IA e estou aqui para ajudar você a aprender melhor.

Pode me fazer perguntas sobre a aula, pedir explicações mais simples, exemplos práticos, ou usar os botões rápidos para:

• Gerar um resumo da aula
• Criar um quiz para testar seu conhecimento
• Fazer flashcards para revisão
• Ver exemplos práticos do conteúdo

Como posso te ajudar?`,
}

export function useAiTutorChat(rentHash: string | undefined) {
  const { user } = useAuth()
  const userId = user?.id ?? ""
  const [messages, setMessages] = useState<TutorChatMessage[]>([WELCOME])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const conversationIdRef = useRef<string | null>(null)

  useEffect(() => {
    conversationIdRef.current = conversationId
  }, [conversationId])

  useEffect(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setError(null)
    setIsStreaming(false)
    setReady(false)
    setMessages([WELCOME])
    setConversationId(null)
    conversationIdRef.current = null

    if (!rentHash?.trim() || !userId) {
      setReady(true)
      return
    }

    const key = tutorConversationStorageKey(userId, rentHash.trim())
    const stored = sessionStorage.getItem(key)?.trim() || null
    if (!stored) {
      setReady(true)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const history = await fetchTutorHistory(stored)
        if (cancelled) return
        setConversationId(stored)
        conversationIdRef.current = stored
        if (history.length > 0) {
          setMessages([WELCOME, ...history])
        }
      } catch {
        if (!cancelled) {
          sessionStorage.removeItem(key)
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [rentHash, userId])

  const persistConversationId = useCallback(
    (id: string) => {
      setConversationId(id)
      conversationIdRef.current = id
      if (userId && rentHash?.trim()) {
        sessionStorage.setItem(
          tutorConversationStorageKey(userId, rentHash.trim()),
          id,
        )
      }
    },
    [rentHash, userId],
  )

  const sendQuestion = useCallback(
    async (rawQuestion: string, displayText?: string) => {
      const question = rawQuestion.trim()
      if (!question || isStreaming) return
      if (!rentHash?.trim()) {
        setError("Tutor indisponível para esta aula (sem vínculo Alice).")
        return
      }

      setError(null)
      const userMessage: TutorChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: displayText?.trim() || question,
      }
      const assistantId = `a-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: "assistant", content: "" },
      ])
      setIsStreaming(true)

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        await streamTutorChat(
          {
            question,
            rentHash: rentHash.trim(),
            conversationId: conversationIdRef.current,
            signal: controller.signal,
          },
          {
            onMeta: (id) => persistConversationId(id),
            onToken: (delta) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + delta }
                    : m,
                ),
              )
            },
            onError: (message) => setError(message),
          },
        )
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return
        const message =
          err instanceof Error ? err.message : "Falha ao falar com o tutor."
        setError(message)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId && !m.content.trim()
              ? {
                  ...m,
                  content:
                    "Não consegui responder agora. Tente novamente em instantes.",
                }
              : m,
          ),
        )
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [isStreaming, persistConversationId, rentHash],
  )

  const sendQuickAction = useCallback(
    async (actionId: string) => {
      const prompt = TUTOR_QUICK_PROMPTS[actionId]
      if (!prompt) return
      const labels: Record<string, string> = {
        resumo: "Resumo",
        quiz: "Quiz",
        flashcards: "Flashcards",
        exemplos: "Exemplos",
      }
      await sendQuestion(prompt, labels[actionId] ?? actionId)
    },
    [sendQuestion],
  )

  return {
    messages,
    isStreaming,
    error,
    ready,
    available: Boolean(rentHash?.trim()),
    sendQuestion,
    sendQuickAction,
  }
}
