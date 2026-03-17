import { useState } from 'react';
import { ChevronDown, ChevronRight, Paperclip, Trash2, FileText, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { Textarea } from '@/components/ui/textarea';
import { KanbanTask, columnConfig } from '@/data/integratorMockData';
import { TaskEvidenceDialog } from './TaskEvidenceDialog';

interface KanbanListViewProps {
  tasks: KanbanTask[];
  onUpdateTask: (task: KanbanTask) => void;
  disabled?: boolean;
}

const statusConfig = {
  todo: { label: 'A fazer', variant: 'secondary' as const },
  in_progress: { label: 'Em progresso', variant: 'default' as const },
  done: { label: 'Concluído', variant: 'outline' as const }
};

export function KanbanListView({ 
  tasks, 
  onUpdateTask, 
  disabled = false 
}: KanbanListViewProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const columns = ['planning', 'research', 'execution', 'review', 'delivery'] as const;

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleStatusChange = (task: KanbanTask, newStatus: KanbanTask['status']) => {
    onUpdateTask({ ...task, status: newStatus });
  };

  const handleChecklistToggle = (task: KanbanTask, itemId: string) => {
    const updatedChecklist = task.checklist.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    onUpdateTask({ ...task, checklist: updatedChecklist });
  };

  const handleNotesChange = (task: KanbanTask, notes: string) => {
    onUpdateTask({ ...task, notes });
  };

  const handleOpenEvidenceDialog = (taskId: string) => {
    setSelectedTaskId(taskId);
    setEvidenceDialogOpen(true);
  };

  const handleAddEvidence = (evidence: { type: 'file' | 'link'; title: string; url: string; fileType?: string }) => {
    if (!selectedTaskId) return;
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    const newEvidence = {
      id: `ev-${Date.now()}`,
      ...evidence,
      uploadedAt: new Date().toISOString()
    };

    onUpdateTask({
      ...task,
      evidences: [...task.evidences, newEvidence]
    });
  };

  const handleRemoveEvidence = (task: KanbanTask, evidenceId: string) => {
    onUpdateTask({
      ...task,
      evidences: task.evidences.filter(e => e.id !== evidenceId)
    });
  };


  const getTasksByColumn = (columnId: string) => {
    return tasks.filter(task => task.column === columnId);
  };

  return (
    <div className="space-y-6">
      {columns.map((columnId) => {
        const config = columnConfig[columnId];
        const columnTasks = getTasksByColumn(columnId);

        return (
          <div key={columnId} className="space-y-2">
            {/* Column Header */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.color} bg-opacity-10`}>
              <div className={`w-3 h-3 rounded-full ${config.color.replace('bg-', 'bg-')}`} />
              <span className="font-medium">{config.label}</span>
              <Badge variant="secondary" className="ml-auto">
                {columnTasks.length} {columnTasks.length === 1 ? 'tarefa' : 'tarefas'}
              </Badge>
            </div>

            {/* Tasks List */}
            <div className="space-y-1 pl-2">
              {columnTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2 px-3">
                  Nenhuma tarefa nesta etapa
                </p>
              ) : (
                columnTasks.map((task) => {
                  const isExpanded = expandedTasks.has(task.id);
                  const statusInfo = statusConfig[task.status];
                  const completedItems = task.checklist.filter(i => i.checked).length;
                  const totalItems = task.checklist.length;

                  return (
                    <Collapsible
                      key={task.id}
                      open={isExpanded}
                      onOpenChange={() => toggleExpanded(task.id)}
                    >
                      <div className="border rounded-lg bg-card">
                        {/* Task Row */}
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            
                            <span className="flex-1 text-sm font-medium truncate">
                              {task.title}
                            </span>

                            {totalItems > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {completedItems}/{totalItems}
                              </span>
                            )}

                            <Badge variant={statusInfo.variant} className="text-xs">
                              {statusInfo.label}
                            </Badge>

                            {task.evidences.length > 0 && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Paperclip className="h-3 w-3" />
                                <span className="text-xs">{task.evidences.length}</span>
                              </div>
                            )}
                          </div>
                        </CollapsibleTrigger>

                        {/* Expanded Content */}
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-2 border-t space-y-4">
                            {/* Status Selector */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Status:</span>
                              <div className="flex gap-1">
                                {(['todo', 'in_progress', 'done'] as const).map((status) => (
                                  <Button
                                    key={status}
                                    variant={task.status === status ? 'default' : 'outline'}
                                    size="sm"
                                    className="text-xs h-7"
                                    onClick={() => handleStatusChange(task, status)}
                                    disabled={disabled}
                                  >
                                    {statusConfig[status].label}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* Checklist */}
                            {task.checklist.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-sm font-medium">Checklist</span>
                                <div className="space-y-1">
                                  {task.checklist.map((item) => (
                                    <div key={item.id} className="flex items-center gap-2">
                                      <Checkbox
                                        checked={item.checked}
                                        onCheckedChange={() => handleChecklistToggle(task, item.id)}
                                        disabled={disabled}
                                      />
                                      <span className={`text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                                        {item.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Notes */}
                            <div className="space-y-2">
                              <span className="text-sm font-medium">Observações</span>
                              <Textarea
                                value={task.notes}
                                onChange={(e) => handleNotesChange(task, e.target.value)}
                                placeholder="Adicione suas observações..."
                                className="min-h-[60px] text-sm"
                                disabled={disabled}
                              />
                            </div>

                            {/* Evidences */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Evidências</span>
                                {!disabled && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => handleOpenEvidenceDialog(task.id)}
                                  >
                                    <Paperclip className="h-3 w-3 mr-1" />
                                    Anexar
                                  </Button>
                                )}
                              </div>
                              
                              {task.evidences.length > 0 ? (
                                <div className="space-y-1">
                                  {task.evidences.map((evidence) => (
                                    <div
                                      key={evidence.id}
                                      className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                                    >
                                      {evidence.type === 'file' ? (
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      <span className="flex-1 truncate">{evidence.title}</span>
                                      {!disabled && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                          onClick={() => handleRemoveEvidence(task, evidence.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  Nenhuma evidência anexada
                                </p>
                              )}
                            </div>

                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })
              )}
            </div>
          </div>
        );
      })}

      <TaskEvidenceDialog
        open={evidenceDialogOpen}
        onOpenChange={setEvidenceDialogOpen}
        onAddEvidence={handleAddEvidence}
      />
    </div>
  );
}
