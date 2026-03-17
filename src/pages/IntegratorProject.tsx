import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock, LayoutGrid, BookOpen, Upload, Send, Info, ArrowLeft } from 'lucide-react';

import { ProjectHeader } from '@/components/integrator/ProjectHeader';
import { ProjectOverview } from '@/components/integrator/ProjectOverview';
import { KanbanBoard } from '@/components/integrator/KanbanBoard';
import { ProjectDiary } from '@/components/integrator/ProjectDiary';
import { EvidenceUpload } from '@/components/integrator/EvidenceUpload';
import { FinalSubmission } from '@/components/integrator/FinalSubmission';
import { SelfAssessment } from '@/components/integrator/SelfAssessment';

import { mockIntegratorProjects, mockKanbanTasks, IntegratorProject, KanbanTask } from '@/data/integratorMockData';

export default function IntegratorProjectPage() {
  const { id } = useParams<{ id: string }>();
  const foundProject = mockIntegratorProjects.find(p => p.id === id);
  
  const [project, setProject] = useState<IntegratorProject | undefined>(foundProject);
  const [tasks, setTasks] = useState<KanbanTask[]>(mockKanbanTasks);
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect to list if project not found
  if (!project) {
    return <Navigate to="/projeto-integrador" replace />;
  }

  const isSubmitted = project.status === 'submitted';

  const handleSubmit = () => {
    setProject({ ...project, status: 'submitted', progress: 100 });
  };

  const handleUpdateTasks = (updatedTasks: KanbanTask[]) => {
    setTasks(updatedTasks);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Back Button */}
        <Link to="/projeto-integrador">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para projetos
          </Button>
        </Link>

        {/* Header */}
        <ProjectHeader project={project} />

        {/* Submitted Alert */}
        {isSubmitted && (
          <Alert className="bg-green-500/10 border-green-500/30">
            <Lock className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-200">
              Este projeto foi entregue e está em modo somente leitura.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-muted/30 border border-border/50 h-auto p-1 flex-wrap">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background gap-2">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="kanban" className="data-[state=active]:bg-background gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </TabsTrigger>
            <TabsTrigger value="diary" className="data-[state=active]:bg-background gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Diário</span>
            </TabsTrigger>
            <TabsTrigger value="evidence" className="data-[state=active]:bg-background gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Evidências</span>
            </TabsTrigger>
            <TabsTrigger value="submission" className="data-[state=active]:bg-background gap-2">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Entrega</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ProjectOverview project={project} />
          </TabsContent>

          <TabsContent value="kanban" className="mt-6">
            <KanbanBoard 
              disabled={isSubmitted} 
              tasks={tasks}
              onUpdateTasks={handleUpdateTasks}
            />
          </TabsContent>

          <TabsContent value="diary" className="mt-6">
            <ProjectDiary disabled={isSubmitted} />
          </TabsContent>

          <TabsContent value="evidence" className="mt-6">
            <EvidenceUpload tasks={tasks} disabled={isSubmitted} />
          </TabsContent>

          <TabsContent value="submission" className="mt-6 space-y-6">
            <FinalSubmission isSubmitted={isSubmitted} onSubmit={handleSubmit} />
            <SelfAssessment disabled={isSubmitted} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
