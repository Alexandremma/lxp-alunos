import { useState } from "react";
import { Bot, X, Send, User, FileText, HelpCircle, Layers, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AiTutorSidebarProps {
  lessonTitle: string;
  onClose: () => void;
}

const quickActions = [
  { id: "resumo", label: "Resumo", icon: FileText },
  { id: "quiz", label: "Quiz", icon: HelpCircle },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "exemplos", label: "Exemplos", icon: Lightbulb },
];

const mockResponses: Record<string, string> = {
  "resumo": 
    "📝 **Resumo da Aula:**\n\n1. **Redes Neurais** são modelos computacionais inspirados no cérebro\n2. **Deep Learning** = redes com muitas camadas (profundas)\n3. **Neurônios artificiais** recebem inputs, aplicam pesos e geram outputs\n4. **Backpropagation** é como a rede aprende, ajustando pesos\n5. **Aplicações** vão de visão computacional a processamento de linguagem\n\n💡 Dica: Pratique implementando uma rede simples!",
  
  "quiz":
    "🎯 **Quiz: Redes Neurais**\n\n**1.** O que é uma época (epoch) no treinamento?\na) Um neurônio\nb) Uma passagem completa pelos dados\nc) Um tipo de rede\n\n**2.** Qual função é comum para ativação?\na) ReLU\nb) HTTP\nc) SQL\n\n**3.** Backpropagation serve para:\na) Gerar dados\nb) Ajustar pesos da rede\nc) Criar camadas\n\n---\n✅ Respostas: 1-b, 2-a, 3-b\n\nQuer mais perguntas?",
  
  "flashcards":
    "🗂️ **Flashcards Gerados:**\n\n**Card 1**\n❓ O que é Deep Learning?\n💡 Redes neurais com múltiplas camadas que aprendem representações hierárquicas dos dados.\n\n**Card 2**\n❓ O que é Backpropagation?\n💡 Algoritmo que calcula gradientes para ajustar os pesos da rede durante o treinamento.\n\n**Card 3**\n❓ O que é uma função de ativação?\n💡 Função que introduz não-linearidade na rede (ex: ReLU, Sigmoid).\n\nQuer que eu gere mais flashcards?",
  
  "exemplos":
    "Aqui estão exemplos práticos de Deep Learning no dia a dia:\n\n🎯 **Reconhecimento facial** - Desbloqueio do celular\n🗣️ **Assistentes virtuais** - Siri, Alexa, Google Assistant\n🚗 **Carros autônomos** - Tesla, Waymo\n🏥 **Diagnóstico médico** - Detecção de câncer em imagens\n🎬 **Recomendações** - Netflix, Spotify, YouTube\n🌐 **Tradução automática** - Google Tradutor\n\nQuer que eu aprofunde em algum desses?",
};

export function AiTutorSidebar({ lessonTitle, onClose }: AiTutorSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `👋 Olá! Sou seu tutor de IA e estou aqui para ajudar você a aprender melhor.

Pode me fazer perguntas sobre a aula, pedir explicações mais simples, exemplos práticos, ou usar os botões rápidos acima para:

• 📄 **Gerar um resumo** da aula
• 🎯 **Criar um quiz** para testar seu conhecimento
• 🗂️ **Fazer flashcards** para revisão
• 💡 **Ver exemplos práticos** do conteúdo

Como posso te ajudar? 😊`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (text: string, actionId?: string) => {
    if (!text.trim() && !actionId) return;

    const displayText = actionId 
      ? quickActions.find(a => a.id === actionId)?.label || text
      : text;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: displayText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const response = actionId 
      ? mockResponses[actionId]
      : "Ótima pergunta! Baseado no conteúdo desta aula, posso explicar que este é um tema fundamental para seu aprendizado. Se precisar de mais detalhes ou exemplos específicos, é só me perguntar! 🎓";

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleQuickAction = (actionId: string) => {
    handleSend("", actionId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Tutor de IA</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{lessonTitle}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="border-b px-4 py-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Ações Rápidas:
        </p>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              disabled={isTyping}
              className="flex flex-col items-center gap-1.5 rounded-lg border bg-card p-2 text-center transition-colors hover:bg-accent hover:border-primary/50 disabled:opacity-50"
            >
              <action.icon className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback
                  className={cn(
                    "text-xs",
                    message.role === "assistant"
                      ? "bg-gradient-to-br from-primary to-primary/60 text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.role === "assistant" ? (
                    <Bot className="h-3.5 w-3.5" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "rounded-lg px-3 py-2 text-sm max-w-[85%]",
                  message.role === "assistant"
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground"
                )}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                  <Bot className="h-3.5 w-3.5" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg bg-muted px-3 py-2">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta... (Shift+Enter para nova linha)"
            className="flex-1 rounded-lg border bg-muted/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button
            size="icon"
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Powered by Lovable AI • Limite: 15 mensagens/min
        </p>
      </div>
    </div>
  );
}
