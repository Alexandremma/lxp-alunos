import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, ChevronLeft, Eye, EyeOff, StickyNote, MessageCircle, GraduationCap, Heart, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { LessonSidebar } from "./LessonSidebar";
import { AiTutorFab } from "./AiTutorFab";
import { AiTutorSidebar } from "./AiTutorSidebar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Trail, TrailModule as Module, TrailLesson as Lesson } from "@/services/trailAdapter";

// Mock comments data
const mockComments = [
  {
    id: "1",
    user: { name: "Maria Silva", initials: "MS" },
    content: "Excelente explicação sobre redes neurais! Finalmente entendi como funciona o processo de backpropagation. O exemplo prático ajudou muito.",
    timestamp: "há 2 dias",
    likes: 12,
    liked: false,
    replies: [
      {
        id: "1-1",
        user: { name: "Prof. Carlos Mendes", initials: "CM" },
        content: "Fico feliz que tenha ajudado, Maria! Se tiver mais dúvidas sobre o tema, estou à disposição.",
        timestamp: "há 1 dia",
        likes: 5,
        liked: false,
        isInstructor: true
      }
    ]
  },
  {
    id: "2",
    user: { name: "João Santos", initials: "JS" },
    content: "No minuto 3:45 o professor menciona 'função de custo'. Alguém pode explicar melhor esse conceito? Fiquei com dúvida.",
    timestamp: "há 5 horas",
    likes: 3,
    liked: false,
    replies: [
      {
        id: "2-1",
        user: { name: "Ana Oliveira", initials: "AO" },
        content: "A função de custo mede o erro entre a previsão do modelo e o valor real. Quanto menor, melhor o modelo está performando!",
        timestamp: "há 3 horas",
        likes: 7,
        liked: false,
        isInstructor: false
      }
    ]
  },
  {
    id: "3",
    user: { name: "Pedro Almeida", initials: "PA" },
    content: "Encontrei um artigo muito bom que complementa essa aula: 'Deep Learning Book' do Ian Goodfellow. Recomendo para quem quer se aprofundar!",
    timestamp: "há 1 dia",
    likes: 18,
    liked: true,
    replies: []
  },
  {
    id: "4",
    user: { name: "Carla Rodrigues", initials: "CR" },
    content: "Qual a diferença entre Machine Learning e Deep Learning? O professor mencionou rapidamente mas não ficou claro pra mim.",
    timestamp: "há 3 horas",
    likes: 2,
    liked: false,
    replies: []
  },
  {
    id: "5",
    user: { name: "Lucas Fernandes", initials: "LF" },
    content: "Acabei de assistir e já estou ansioso para a próxima aula! O conteúdo está muito bem estruturado. 🚀",
    timestamp: "há 30 min",
    likes: 0,
    liked: false,
    replies: []
  }
];

interface LessonLayoutProps {
  children: React.ReactNode;
  trail: Trail;
  modules: Module[];
  currentLesson: Lesson;
  allLessons: Lesson[];
  progress: number;
}

export const LessonLayout = ({
  children,
  trail,
  modules,
  currentLesson,
  allLessons,
  progress,
}: LessonLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [leftSidebarOpen, setLeftSidebarOpen] = React.useState(true);
  const [rightPanel, setRightPanel] = React.useState<'notes' | 'discussion' | null>(null);
  const [aiTutorOpen, setAiTutorOpen] = React.useState(false);

  const handleClose = () => {
    navigate(`/trails/${trail.id}`);
  };

  const toggleNotes = () => {
    setRightPanel(rightPanel === 'notes' ? null : 'notes');
    setAiTutorOpen(false);
  };

  const toggleDiscussion = () => {
    setRightPanel(rightPanel === 'discussion' ? null : 'discussion');
    setAiTutorOpen(false);
  };

  const toggleAiTutor = () => {
    setAiTutorOpen(!aiTutorOpen);
    if (!aiTutorOpen) {
      setRightPanel(null);
    }
  };

  return (
    <TooltipProvider>
      <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <Eye className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  <LessonSidebar
                    trail={trail}
                    modules={modules}
                    currentLesson={currentLesson}
                    allLessons={allLessons}
                    onLessonClick={() => {}}
                  />
                </SheetContent>
              </Sheet>
            )}

            {/* Logo + Back */}
            <Link
              to={`/trails/${trail.id}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <div className="hidden sm:flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">{trail.title}</span>
              </div>
            </Link>
          </div>

          {/* Progress */}
          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <div className="flex items-center gap-3">
              <Progress value={progress} className="h-2 flex-1" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {progress}% concluído
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Reading Mode Toggle - Desktop only */}
            {!isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                    className={cn(
                      "text-muted-foreground",
                      !leftSidebarOpen && "text-primary bg-primary/10"
                    )}
                  >
                    {leftSidebarOpen ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {leftSidebarOpen ? "Modo leitura" : "Mostrar navegação"}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Notes Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggleNotes}
                  className={cn(
                    "text-muted-foreground",
                    rightPanel === 'notes' && "text-primary bg-primary/10"
                  )}
                >
                  <StickyNote className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Anotações</TooltipContent>
            </Tooltip>

            {/* Discussion Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggleDiscussion}
                  className={cn(
                    "text-muted-foreground",
                    rightPanel === 'discussion' && "text-primary bg-primary/10"
                  )}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Discussão</TooltipContent>
            </Tooltip>

            {/* Separator */}
            <div className="w-px h-5 bg-border mx-1" />

            {/* Close Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={handleClose}>
                  <X className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fechar</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Desktop only */}
          {!isMobile && (
            <aside
              className={cn(
                "border-r border-border bg-card overflow-y-auto transition-all duration-300 shrink-0",
                leftSidebarOpen ? "w-80" : "w-0"
              )}
            >
              {leftSidebarOpen && (
                <LessonSidebar
                  trail={trail}
                  modules={modules}
                  currentLesson={currentLesson}
                  allLessons={allLessons}
                  onLessonClick={() => {}}
                />
              )}
            </aside>
          )}

          {/* Content */}
          <main className="flex-1 overflow-y-auto scrollbar-thin relative">
            {children}
            
            {/* AI Tutor FAB */}
            {!aiTutorOpen && (
              <AiTutorFab onClick={toggleAiTutor} />
            )}
          </main>

          {/* AI Tutor Sidebar */}
          {aiTutorOpen && (
            <aside className="border-l border-border bg-card shrink-0 h-full w-80 lg:w-96 overflow-hidden">
              <AiTutorSidebar
                lessonTitle={currentLesson.title}
                onClose={() => setAiTutorOpen(false)}
              />
            </aside>
          )}

          {/* Right Sidebar - Notes & Discussion */}
          <aside
            className={cn(
              "border-l border-border bg-card overflow-hidden transition-all duration-300 shrink-0",
              rightPanel ? "w-80 lg:w-96" : "w-0"
            )}
          >
            {rightPanel && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">
                    {rightPanel === 'notes' ? 'Anotações' : 'Discussão'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rightPanel === 'notes' 
                      ? 'Suas notas para esta aula'
                      : 'Comentários e perguntas'
                    }
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {rightPanel === 'notes' ? (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Escreva suas anotações aqui..."
                        className="min-h-[120px] resize-none"
                      />
                      <Button size="sm" className="w-full">
                        Salvar anotação
                      </Button>
                      
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Suas anotações aparecerão aqui
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Faça uma pergunta ou comentário..."
                        className="min-h-[80px] resize-none"
                      />
                      <Button size="sm" className="w-full">
                        Enviar comentário
                      </Button>
                      
                      <div className="pt-4 border-t border-border space-y-4">
                        {mockComments.map((comment) => (
                          <div key={comment.id} className="space-y-3">
                            {/* Main comment */}
                            <div className="space-y-2">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8 shrink-0">
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {comment.user.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium text-foreground">
                                      {comment.user.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {comment.timestamp}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground/90 mt-1 leading-relaxed">
                                    {comment.content}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <button className={cn(
                                      "flex items-center gap-1 text-xs transition-colors",
                                      comment.liked 
                                        ? "text-red-500" 
                                        : "text-muted-foreground hover:text-red-500"
                                    )}>
                                      <Heart className={cn("h-3.5 w-3.5", comment.liked && "fill-current")} />
                                      {comment.likes > 0 && comment.likes}
                                    </button>
                                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                                      <Reply className="h-3.5 w-3.5" />
                                      Responder
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Replies */}
                            {comment.replies.length > 0 && (
                              <div className="ml-8 pl-3 border-l-2 border-border space-y-3">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex items-start gap-3">
                                    <Avatar className="h-7 w-7 shrink-0">
                                      <AvatarFallback className={cn(
                                        "text-xs",
                                        reply.isInstructor 
                                          ? "bg-amber-500/20 text-amber-600" 
                                          : "bg-secondary text-secondary-foreground"
                                      )}>
                                        {reply.user.initials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-foreground">
                                          {reply.user.name}
                                        </span>
                                        {reply.isInstructor && (
                                          <Badge variant="warning" size="sm">
                                            Instrutor
                                          </Badge>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                          {reply.timestamp}
                                        </span>
                                      </div>
                                      <p className="text-sm text-foreground/90 mt-1 leading-relaxed">
                                        {reply.content}
                                      </p>
                                      <button className={cn(
                                        "flex items-center gap-1 text-xs mt-2 transition-colors",
                                        reply.liked 
                                          ? "text-red-500" 
                                          : "text-muted-foreground hover:text-red-500"
                                      )}>
                                        <Heart className={cn("h-3.5 w-3.5", reply.liked && "fill-current")} />
                                        {reply.likes > 0 && reply.likes}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </TooltipProvider>
  );
};
