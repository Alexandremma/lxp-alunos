import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Clock, BookOpen, Trophy, User, Calendar } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProgressRing } from "@/components/learning/ProgressRing";
import { LessonCard } from "@/components/learning/LessonCard";
import { TrailCalendar } from "@/components/learning/TrailCalendar";
import { useTrailDetail } from "@/hooks/queries/useTrailDetail";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const TrailDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { trail, modules, lessons, isLoading } = useTrailDetail(id || undefined);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando trilha...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!trail) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Trilha não encontrada</p>
          <Link to="/trails">
            <Button variant="outline" className="mt-4">Voltar para Trilhas</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const totalLessons = lessons.length || 0;
  const completedLessons = 0;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const moduleLessons = lessons.filter((l) => modules.some((m: any) => m.id === l.moduleId));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        {/* Back Button */}
        <Link to="/trails" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Voltar para Trilhas
        </Link>

        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden">
          <img src={trail.thumbnail ?? "/placeholder.svg"} alt={trail.title} className="w-full h-64 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {trail.category && <Badge variant="secondary" className="mb-3">{trail.category}</Badge>}
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{trail.title}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">{trail.description}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <div><p className="text-lg font-bold">{trail.totalLessons}</p><p className="text-xs text-muted-foreground">Aulas</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-secondary" />
            <div><p className="text-lg font-bold">{trail.estimatedHours}h</p><p className="text-xs text-muted-foreground">Duração</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-warning" />
            <div><p className="text-lg font-bold">+{trail.xpReward}</p><p className="text-xs text-muted-foreground">XP</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <User className="w-5 h-5 text-info" />
            <div><p className="text-sm font-medium truncate">{trail.instructor}</p><p className="text-xs text-muted-foreground">Instrutor</p></div>
          </CardContent></Card>
          {trail.deadline && (
            <Card><CardContent className="p-4 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-destructive" />
              <div><p className="text-sm font-medium">{format(parseISO(trail.deadline), "dd MMM", { locale: ptBR })}</p><p className="text-xs text-muted-foreground">Prazo</p></div>
            </CardContent></Card>
          )}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Modules */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">Módulos</h2>
            <Accordion type="single" collapsible defaultValue="mod-001-4" className="space-y-3">
              {modules.map((module) => (
                <AccordionItem key={module.id} value={module.id} className="border rounded-lg bg-card px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${module.status === 'completed' ? 'bg-success text-success-foreground' : module.status === 'in_progress' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {module.order}
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{module.title}</p>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-2">
                    {moduleLessons.filter((l) => l.moduleId === module.id).map((lesson) => (
                      <LessonCard key={lesson.id} lesson={lesson} trailId={trail.id} />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Seu Progresso</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <ProgressRing progress={progress} size="xl" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{trail.completedLessons} de {trail.totalLessons} aulas concluídas</p>
                </div>
                <Progress value={progress} className="w-full" />
                <Button className="w-full">Continuar</Button>
              </CardContent>
            </Card>

            {/* Calendário de Marcos */}
            <TrailCalendar trailId={trail.id} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrailDetail;
