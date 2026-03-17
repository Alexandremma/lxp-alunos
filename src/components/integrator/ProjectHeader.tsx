import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Layers, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { IntegratorProject } from '@/data/integratorMockData';

interface ProjectHeaderProps {
  project: IntegratorProject;
}

const statusConfig = {
  in_progress: { label: 'Em andamento', variant: 'default' as const, className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  in_review: { label: 'Em revisão', variant: 'secondary' as const, className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  submitted: { label: 'Entregue', variant: 'default' as const, className: 'bg-green-500/20 text-green-400 border-green-500/30' }
};

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const status = statusConfig[project.status];
  const deadlineDate = new Date(project.deadline);
  const formattedDeadline = format(deadlineDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge className={status.className}>
                {project.status === 'submitted' && <Lock className="h-3 w-3 mr-1" />}
                {status.label}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Prazo: {formattedDeadline}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Progress value={project.progress} className="h-2" />
        </div>
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          {project.progress}% concluído
        </span>
      </div>
    </div>
  );
}
