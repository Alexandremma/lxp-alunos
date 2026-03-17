import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMilestonesByTrailId, TrailMilestone } from "@/data/mockData";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BookOpen, FileText, GraduationCap, FolderOpen, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrailCalendarProps {
  trailId: string;
}

const milestoneConfig: Record<TrailMilestone["type"], { icon: typeof BookOpen; color: string; label: string }> = {
  lesson_release: { icon: BookOpen, color: "bg-success", label: "Liberação" },
  activity_deadline: { icon: FileText, color: "bg-warning", label: "Atividade" },
  quiz: { icon: ClipboardCheck, color: "bg-info", label: "Quiz" },
  exam: { icon: GraduationCap, color: "bg-primary", label: "Prova" },
  project_deadline: { icon: FolderOpen, color: "bg-secondary", label: "Projeto" },
};

export const TrailCalendar = ({ trailId }: TrailCalendarProps) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const milestones = getMilestonesByTrailId(trailId);

  // Get dates that have milestones
  const milestoneDates = milestones.map((m) => parseISO(m.date));

  // Get milestones for selected date
  const selectedMilestones = selectedDate
    ? milestones.filter((m) => isSameDay(parseISO(m.date), selectedDate))
    : [];

  // Upcoming milestones sorted by date
  const upcomingMilestones = milestones
    .filter((m) => parseISO(m.date) >= new Date())
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Cronograma da Trilha</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={ptBR}
          className="rounded-md border p-0 pointer-events-auto"
          modifiers={{
            milestone: milestoneDates,
          }}
          modifiersClassNames={{
            milestone: "font-bold text-primary",
          }}
        />

        {/* Selected day milestones */}
        {selectedMilestones.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {format(selectedDate!, "d 'de' MMMM", { locale: ptBR })}
            </p>
            {selectedMilestones.map((milestone) => {
              const config = milestoneConfig[milestone.type];
              const Icon = config.icon;
              return (
                <div
                  key={milestone.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                >
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", config.color)}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm flex-1 truncate">{milestone.title}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Upcoming events */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Próximos Eventos</p>
          {upcomingMilestones.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum evento próximo</p>
          ) : (
            <div className="space-y-2">
              {upcomingMilestones.map((milestone) => {
                const config = milestoneConfig[milestone.type];
                const Icon = config.icon;
                const isToday = isSameDay(parseISO(milestone.date), new Date());

                return (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", config.color)}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 flex-shrink-0">
                      {format(parseISO(milestone.date), "dd MMM", { locale: ptBR })}
                    </span>
                    <span className="truncate flex-1">{milestone.title}</span>
                    {isToday && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        Hoje
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
