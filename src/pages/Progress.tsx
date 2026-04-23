import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/learning/ProgressRing";
import { FeedbackBadge } from "@/components/learning/FeedbackBadge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { useProgressOverview } from "@/hooks/queries/useProgressOverview";
import { QueryStateCard } from "@/components/states/QueryStateCard";
import { BookOpen } from "lucide-react";

const Progress = () => {
  const { profile } = useAuth();
  const { data, isLoading, error, refetch } = useProgressOverview(profile?.id);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fade-up">
          <PageHeader title="Meu Progresso" description="Acompanhe sua evolução e estatísticas de aprendizagem." />
          <QueryStateCard state="loading" title="Carregando seu progresso..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fade-up">
          <PageHeader title="Meu Progresso" description="Acompanhe sua evolução e estatísticas de aprendizagem." />
          <QueryStateCard
            state="error"
            title="Nao foi possivel carregar seu progresso."
            description="Tente novamente para atualizar seus indicadores."
            actionLabel="Tentar novamente"
            onAction={() => void refetch()}
          />
        </div>
      </DashboardLayout>
    );
  }

  const stats = data.stats;
  const weeklyStudyData = data.weeklyStudyData;
  const trails = data.trails;
  const completionRate = stats.totalTrails > 0 ? Math.round((stats.completedTrails / stats.totalTrails) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <PageHeader title="Meu Progresso" description="Acompanhe sua evolução e estatísticas de aprendizagem." />

        <div className="grid md:grid-cols-4 gap-4">
          <FeedbackBadge type="xp" value={stats.totalXp} label="XP Total" size="lg" className="p-4" />
          <FeedbackBadge type="level" value={`Nível ${stats.level}`} label="Ranking" size="lg" className="p-4" />
          <FeedbackBadge type="streak" value={stats.streak} label="Dias seguidos" size="lg" className="p-4" />
          <FeedbackBadge type="completion" value={`${stats.completedTrails}/${stats.totalTrails}`} label="Trilhas" size="lg" className="p-4" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Horas de Estudo por Dia</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStudyData}>
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Taxa de Conclusão</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <ProgressRing progress={completionRate} size="xl" color="success" />
                <p className="mt-4 text-muted-foreground">{stats.completedTrails} trilhas concluídas de {stats.totalTrails}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Resumo das Trilhas</CardTitle></CardHeader>
          <CardContent>
            {trails.length > 0 ? (
              <div className="space-y-4">
                {trails.map((trail) => (
                  <div key={trail.id} className="flex items-center gap-4">
                    <img src={trail.thumbnail} alt={trail.title} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{trail.title}</p>
                      <p className="text-xs text-muted-foreground">{trail.completedLessons}/{trail.totalLessons} aulas</p>
                    </div>
                    <ProgressRing progress={trail.progressPercent} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <QueryStateCard
                state="empty"
                title="Sem trilhas para exibir"
                description="Quando houver trilhas vinculadas ao seu curso, seu progresso aparecerá aqui."
                icon={BookOpen}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Progress;
