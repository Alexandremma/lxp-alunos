import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, BookOpen, Award, CheckSquare, FileText } from 'lucide-react';
import { IntegratorProject } from '@/data/integratorMockData';

interface ProjectOverviewProps {
  project: IntegratorProject;
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Descrição do Desafio */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Descrição do Desafio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {project.description}
          </p>
        </CardContent>
      </Card>

      {/* Objetivo */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Objetivo do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {project.objective}
          </p>
        </CardContent>
      </Card>

      {/* Competências */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Competências Desenvolvidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {project.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critérios de Avaliação */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-primary" />
            Critérios de Avaliação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {project.evaluationCriteria.map((criteria, index) => (
              <li key={index} className="flex items-start gap-3 text-muted-foreground">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                  {index + 1}
                </span>
                <span>{criteria}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Entregáveis */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckSquare className="h-5 w-5 text-primary" />
            Entregáveis Esperados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {project.deliverables.map((deliverable, index) => (
              <li key={index} className="flex items-center gap-3 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary/50" />
                <span>{deliverable}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
