import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectCard } from '@/components/integrator/ProjectCard';
import { mockIntegratorProjects } from '@/data/integratorMockData';
import { FolderKanban } from 'lucide-react';

type FilterStatus = 'all' | 'not_started' | 'in_progress' | 'in_review' | 'submitted';

export default function IntegratorProjects() {
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filteredProjects = filter === 'all' 
    ? mockIntegratorProjects 
    : mockIntegratorProjects.filter(p => p.status === filter);

  const counts = {
    all: mockIntegratorProjects.length,
    not_started: mockIntegratorProjects.filter(p => p.status === 'not_started').length,
    in_progress: mockIntegratorProjects.filter(p => p.status === 'in_progress').length,
    in_review: mockIntegratorProjects.filter(p => p.status === 'in_review').length,
    submitted: mockIntegratorProjects.filter(p => p.status === 'submitted').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Projetos Integradores"
          description="Gerencie seus projetos acadêmicos interdisciplinares"
        />

        {/* Filters */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
          <TabsList className="bg-muted/30 border border-border/50">
            <TabsTrigger value="all" className="data-[state=active]:bg-background">
              Todos ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="not_started" className="data-[state=active]:bg-background">
              Não iniciados ({counts.not_started})
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="data-[state=active]:bg-background">
              Em andamento ({counts.in_progress})
            </TabsTrigger>
            <TabsTrigger value="in_review" className="data-[state=active]:bg-background">
              Em revisão ({counts.in_review})
            </TabsTrigger>
            <TabsTrigger value="submitted" className="data-[state=active]:bg-background">
              Entregues ({counts.submitted})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <FolderKanban className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground">
              Não há projetos com o filtro selecionado.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
