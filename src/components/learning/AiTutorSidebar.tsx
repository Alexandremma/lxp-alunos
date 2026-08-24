import { useMemo, useState } from "react"
import { Bot, X, Send, FileText, HelpCircle, Layers, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserAvatar } from "@/components/profile/UserAvatar"
import { useAuth } from "@/hooks/use-auth"
import { useAiTutorChat } from "@/hooks/useAiTutorChat"
import { cn } from "@/lib/utils"

interface AiTutorSidebarProps {
  lessonTitle: string
  /** `rent.hash` Alice — obrigatório para RAG MAIA */
  rentHash?: string
  onClose: () => void
}

const quickActions = [
  { id: "resumo", label: "Resumo", icon: FileText },
  { id: "quiz", label: "Quiz", icon: HelpCircle },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "exemplos", label: "Exemplos", icon: Lightbulb },
] as const

export function AiTutorSidebar({
  lessonTitle,
  rentHash,
  onClose,
}: AiTutorSidebarProps) {
  const { profile, user } = useAuth()
  const [input, setInput] = useState("")
  const {
    messages,
    isStreaming,
    error,
    ready,
    available,
    sendQuestion,
    sendQuickAction,
  } = useAiTutorChat(rentHash)

  const userDisplayName = useMemo(() => {
    const fromProfile = profile?.name?.trim()
    if (fromProfile) return fromProfile
    const meta = user?.user_metadata?.full_name
    if (typeof meta === "string" && meta.trim()) return meta.trim()
    const email = user?.email?.trim()
    if (email) return email.split("@")[0] ?? email
    return "Aluno"
  }, [profile?.name, user])

  const userEmail = useMemo(
    () => profile?.email?.trim() || user?.email?.trim() || "",
    [profile?.email, user?.email],
  )

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isStreaming || !available) return
    setInput("")
    await sendQuestion(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <div className="flex items-center justify-between border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Tutor de IA</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {lessonTitle}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!available ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <Bot className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Tutor indisponível nesta aula</p>
          <p className="text-xs text-muted-foreground">
            Esta aula não está vinculada a um conteúdo Alice com{" "}
            <span className="font-mono">rent_hash</span>. Abra uma aula do
            e-book para conversar com o tutor.
          </p>
        </div>
      ) : (
        <>
          <div className="border-b px-4 py-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ações rápidas
            </p>
            <div className="grid grid-cols-4 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => void sendQuickAction(action.id)}
                  disabled={isStreaming || !ready}
                  className="flex flex-col items-center gap-1.5 rounded-lg border bg-card p-2 text-center transition-colors hover:bg-accent hover:border-primary/50 disabled:opacity-50"
                >
                  <action.icon className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-4 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" && "flex-row-reverse",
                  )}
                >
                  {message.role === "assistant" ? (
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                        <Bot className="h-3.5 w-3.5" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <UserAvatar
                      name={userDisplayName}
                      email={userEmail}
                      genericLabel="Aluno"
                      avatarPath={profile?.avatar_path}
                      updatedAt={profile?.updated_at}
                      className="h-7 w-7 shrink-0"
                      fallbackClassName="text-xs"
                    />
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm max-w-[85%]",
                      message.role === "assistant"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground",
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content ||
                        (isStreaming && message.role === "assistant"
                          ? "…"
                          : "")}
                    </p>
                  </div>
                </div>
              ))}

              {isStreaming &&
                messages[messages.length - 1]?.role === "assistant" &&
                !messages[messages.length - 1]?.content && (
                  <div className="flex gap-3">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                        <Bot className="h-3.5 w-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg bg-muted px-3 py-2">
                      <div className="flex gap-1">
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </ScrollArea>

          {error ? (
            <p className="px-4 pb-1 text-center text-xs text-destructive">
              {error}
            </p>
          ) : null}

          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming || !ready}
                placeholder="Digite sua pergunta…"
                className="flex-1 rounded-lg border bg-muted/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
              <Button
                size="icon"
                onClick={() => void handleSend()}
                disabled={!input.trim() || isStreaming || !ready}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Tutor com contexto da aula (Alice)
            </p>
          </div>
        </>
      )}
    </div>
  )
}
