import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Users,
  GraduationCap,
  Trophy,
  Play,
  Clock,
  ArrowRight,
  TrendingUp,
  Calendar,
  FileText,
} from "lucide-react"

// Placeholder data for LXP template
const featuredCourses = [
  {
    id: 1,
    title: "Introdução à Metodologia Científica",
    instructor: "Prof. Ana Silva",
    progress: 65,
    lessons: 12,
    duration: "8h 30min",
    category: "Metodologia",
  },
  {
    id: 2,
    title: "Fundamentos de Gestão Universitária",
    instructor: "Prof. Carlos Santos",
    progress: 30,
    lessons: 18,
    duration: "12h 45min",
    category: "Gestão",
  },
  {
    id: 3,
    title: "Ética e Cidadania na Educação",
    instructor: "Profa. Maria Oliveira",
    progress: 0,
    lessons: 8,
    duration: "5h 15min",
    category: "Formação Geral",
  },
]

const recentActivities = [
  {
    id: 1,
    type: "lesson",
    title: "Aula 5: Pesquisa Quantitativa",
    course: "Metodologia Científica",
    time: "Há 2 horas",
  },
  {
    id: 2,
    type: "quiz",
    title: "Avaliação: Módulo 2",
    course: "Gestão Universitária",
    time: "Há 1 dia",
  },
  {
    id: 3,
    type: "certificate",
    title: "Certificado disponível",
    course: "Comunicação Acadêmica",
    time: "Há 3 dias",
  },
]

const upcomingEvents = [
  {
    id: 1,
    title: "Webinar: Inovação no Ensino Superior",
    date: "15 Jan, 19:00",
    type: "live",
  },
  {
    id: 2,
    title: "Prazo: Entrega do Projeto Final",
    date: "20 Jan, 23:59",
    type: "deadline",
  },
  {
    id: 3,
    title: "Mentoria com Prof. João Costa",
    date: "22 Jan, 14:00",
    type: "meeting",
  },
]

const Index = () => {
  return (
    <DashboardLayout>
      <PageHeader
        title="Bem-vindo à Plataforma"
        description="Continue sua jornada de aprendizado"
      />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Cursos em Andamento"
          value="4"
          subtitle="2 novos esta semana"
          icon={BookOpen}
          variant="primary"
          trend={{ value: 12 }}
        />
        <StatCard
          title="Horas de Estudo"
          value="47h"
          subtitle="Meta: 60h/mês"
          icon={Clock}
          variant="secondary"
          progress={{ current: 47, max: 60 }}
        />
        <StatCard
          title="Certificados"
          value="8"
          subtitle="+2 este mês"
          icon={Trophy}
          variant="success"
          trend={{ value: 25 }}
        />
        <StatCard
          title="Ranking Turma"
          value="5º"
          subtitle="Top 10%"
          icon={TrendingUp}
          variant="primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Continue Aprendendo
                  </CardTitle>
                  <CardDescription>
                    Retome de onde você parou
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  Ver todos
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredCourses.map((course) => (
                <div
                  key={course.id}
                  className="group flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Play className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" size="sm">
                        {course.category}
                      </Badge>
                      {course.progress > 0 && (
                        <Badge variant="info-muted" size="sm">
                          {course.progress}% concluído
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-foreground truncate">
                      {course.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {course.instructor} • {course.lessons} aulas • {course.duration}
                    </p>
                    {course.progress > 0 && (
                      <Progress value={course.progress} className="h-1.5 mt-2" />
                    )}
                  </div>
                  <Button
                    variant={course.progress > 0 ? "default" : "outline"}
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {course.progress > 0 ? "Continuar" : "Iniciar"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {activity.type === "lesson" && <Play className="h-4 w-4 text-primary" />}
                      {activity.type === "quiz" && <FileText className="h-4 w-4 text-warning" />}
                      {activity.type === "certificate" && <Trophy className="h-4 w-4 text-success" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.course}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5 text-primary" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border"
                >
                  <div
                    className={`h-2 w-2 rounded-full mt-2 ${
                      event.type === "live"
                        ? "bg-success"
                        : event.type === "deadline"
                        ? "bg-warning"
                        : "bg-info"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-sm text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-primary" />
                Sua Turma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Alunos ativos</span>
                <span className="font-semibold">48</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taxa de conclusão</span>
                <span className="font-semibold text-success">87%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Média geral</span>
                <span className="font-semibold">8.4</span>
              </div>
            </CardContent>
          </Card>

          {/* CTA Card */}
          <Card variant="glow" className="bg-gradient-to-br from-primary/10 to-secondary/10">
            <CardContent className="pt-6 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Complete seu perfil</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione suas informações para personalizar sua experiência
              </p>
              <Button size="sm" className="w-full">
                Completar Perfil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Index
