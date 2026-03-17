import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  ExternalLink,
  Link as LinkIcon,
  Paperclip,
  FolderOpen
} from 'lucide-react';
import { KanbanTask, TaskEvidence, columnConfig } from '@/data/integratorMockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EvidenceUploadProps {
  tasks: KanbanTask[];
  disabled?: boolean;
}

const fileTypeIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  docx: FileText,
  doc: FileText,
  xlsx: FileSpreadsheet,
  xls: FileSpreadsheet,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  default: FileText
};

const columnLabels: Record<string, string> = {
  planning: 'Planejamento',
  research: 'Pesquisa & Ideação',
  execution: 'Execução',
  review: 'Revisão',
  delivery: 'Entrega Final'
};

export function EvidenceUpload({ tasks, disabled = false }: EvidenceUploadProps) {
  // Group tasks by column that have evidences
  const columns = ['planning', 'research', 'execution', 'review', 'delivery'] as const;
  
  const getEvidenceIcon = (evidence: TaskEvidence) => {
    if (evidence.type === 'link') return LinkIcon;
    const Icon = fileTypeIcons[evidence.fileType?.toLowerCase() || 'default'] || fileTypeIcons.default;
    return Icon;
  };

  // Count total evidences
  const totalEvidences = tasks.reduce((acc, task) => acc + (task.evidences?.length || 0), 0);
  const tasksWithEvidences = tasks.filter(task => (task.evidences?.length || 0) > 0).length;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Paperclip className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Resumo de Evidências</h3>
              <p className="text-sm text-muted-foreground">
                {totalEvidences} {totalEvidences === 1 ? 'evidência' : 'evidências'} em {tasksWithEvidences} {tasksWithEvidences === 1 ? 'tarefa' : 'tarefas'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {totalEvidences === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma evidência anexada ainda.</p>
          <p className="text-sm mt-1">
            Anexe evidências diretamente nas tarefas do Kanban!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {columns.map((columnId) => {
            const config = columnConfig[columnId];
            const columnTasks = tasks.filter(
              task => task.column === columnId && (task.evidences?.length || 0) > 0
            );

            if (columnTasks.length === 0) return null;

            const columnEvidenceCount = columnTasks.reduce(
              (acc, task) => acc + (task.evidences?.length || 0), 0
            );

            return (
              <div key={columnId} className="space-y-3">
                {/* Column Header */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${config.color}`} />
                  <h3 className="font-semibold text-sm text-foreground">
                    {columnLabels[columnId]}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {columnEvidenceCount}
                  </Badge>
                </div>

                {/* Tasks with evidences */}
                <div className="space-y-3 pl-4 border-l-2 border-border/50">
                  {columnTasks.map((task) => (
                    <div key={task.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Tarefa:</span>
                        <span className="text-sm font-medium text-foreground">{task.title}</span>
                      </div>

                      {/* Evidence Cards */}
                      <div className="grid gap-2 sm:grid-cols-2">
                        {task.evidences?.map((evidence) => {
                          const Icon = getEvidenceIcon(evidence);
                          const date = new Date(evidence.uploadedAt);
                          const formattedDate = format(date, "dd/MM/yyyy", { locale: ptBR });

                          return (
                            <Card key={evidence.id} className="border-border/50 bg-card/50">
                              <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${evidence.type === 'link' ? 'bg-blue-500/10' : 'bg-primary/10'}`}>
                                    <Icon className={`h-4 w-4 ${evidence.type === 'link' ? 'text-blue-500' : 'text-primary'}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm text-foreground truncate">
                                      {evidence.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                      {formattedDate}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    onClick={() => window.open(evidence.url, '_blank')}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
