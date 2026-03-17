import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Folder } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { IntegratorProject, statusConfig } from '@/data/integratorMockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectCardProps {
  project: IntegratorProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const config = statusConfig[project.status];
  const deadlineDate = new Date(project.deadline);
  const isOverdue = deadlineDate < new Date() && project.status !== 'submitted';

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-2 ${config.borderColor} bg-card/50 hover:bg-card`}>
      <CardContent className="p-0">
        {/* Thumbnail/Header */}
        <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
          <Folder className="h-16 w-16 text-primary/30" />
          <div className="absolute top-3 right-3">
            <Badge className={config.color}>
              {config.label}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>

          {/* Deadline */}
          <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
            <Calendar className="h-4 w-4" />
            <span>
              Prazo: {format(deadlineDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </span>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          {/* CTA Button */}
          <Link to={`/projeto-integrador/${project.id}`} className="block">
            <Button 
              className="w-full group/btn"
              variant={project.status === 'in_review' ? 'secondary' : 'default'}
              disabled={project.status === 'in_review'}
            >
              {config.cta}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
