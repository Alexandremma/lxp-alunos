import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Circle, Clock, CheckCircle2, MoreHorizontal, Paperclip, FileText, Link as LinkIcon, Trash2, ExternalLink } from 'lucide-react';
import { KanbanTask, TaskEvidence } from '@/data/integratorMockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskEvidenceDialog } from './TaskEvidenceDialog';

interface TaskCardProps {
  task: KanbanTask;
  onUpdateTask: (task: KanbanTask) => void;
  disabled?: boolean;
}

const statusConfig = {
  todo: { label: 'A fazer', icon: Circle, className: 'text-muted-foreground' },
  in_progress: { label: 'Em progresso', icon: Clock, className: 'text-yellow-500' },
  done: { label: 'Concluído', icon: CheckCircle2, className: 'text-green-500' }
};

const fileTypeIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  docx: FileText,
  doc: FileText,
  xlsx: FileText,
  xls: FileText,
  pptx: FileText,
  ppt: FileText,
};

export function TaskCard({ task, onUpdateTask, disabled = false }: TaskCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState(task.notes);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  
  const status = statusConfig[task.status];
  const StatusIcon = status.icon;
  const completedItems = task.checklist.filter(item => item.checked).length;
  const totalItems = task.checklist.length;
  const evidenceCount = task.evidences?.length || 0;

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    const updatedChecklist = task.checklist.map(item =>
      item.id === itemId ? { ...item, checked } : item
    );
    
    // Auto-update status based on checklist
    let newStatus = task.status;
    const allChecked = updatedChecklist.every(item => item.checked);
    const someChecked = updatedChecklist.some(item => item.checked);
    
    if (allChecked && updatedChecklist.length > 0) {
      newStatus = 'done';
    } else if (someChecked) {
      newStatus = 'in_progress';
    } else {
      newStatus = 'todo';
    }
    
    onUpdateTask({ ...task, checklist: updatedChecklist, status: newStatus });
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    onUpdateTask({ ...task, notes: value });
  };

  const handleStatusChange = (newStatus: 'todo' | 'in_progress' | 'done') => {
    onUpdateTask({ ...task, status: newStatus });
  };

  const handleAddEvidence = (evidence: TaskEvidence) => {
    const updatedEvidences = [...(task.evidences || []), evidence];
    onUpdateTask({ ...task, evidences: updatedEvidences });
  };

  const handleDeleteEvidence = (evidenceId: string) => {
    const updatedEvidences = (task.evidences || []).filter(ev => ev.id !== evidenceId);
    onUpdateTask({ ...task, evidences: updatedEvidences });
  };

  const getEvidenceIcon = (evidence: TaskEvidence) => {
    if (evidence.type === 'link') return LinkIcon;
    if (evidence.fileType && fileTypeIcons[evidence.fileType]) {
      return fileTypeIcons[evidence.fileType];
    }
    return FileText;
  };

  return (
    <>
      <Card className="border-border/50 bg-card/80 hover:bg-card transition-colors">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 mt-0.5">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-foreground line-clamp-2">
                    {task.title}
                  </h4>
                  {!disabled && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange('todo')}>
                          <Circle className="h-4 w-4 mr-2 text-muted-foreground" />
                          A fazer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                          <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                          Em progresso
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('done')}>
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                          Concluído
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className={`text-xs ${status.className} border-current/30`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                  {totalItems > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {completedItems}/{totalItems}
                    </span>
                  )}
                  {evidenceCount > 0 && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Paperclip className="h-3 w-3" />
                      {evidenceCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <CollapsibleContent className="mt-3 space-y-3">
              {/* Checklist */}
              {task.checklist.length > 0 && (
                <div className="space-y-2 pl-7">
                  {task.checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        id={item.id}
                        checked={item.checked}
                        onCheckedChange={(checked) => handleChecklistChange(item.id, checked as boolean)}
                        disabled={disabled}
                      />
                      <label
                        htmlFor={item.id}
                        className={`text-sm cursor-pointer ${
                          item.checked ? 'text-muted-foreground line-through' : 'text-foreground'
                        }`}
                      >
                        {item.text}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              <div className="pl-7">
                <Textarea
                  placeholder="Adicionar observações..."
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  className="min-h-[60px] text-sm resize-none"
                  disabled={disabled}
                />
              </div>

              {/* Evidences Section */}
              <div className="pl-7 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Evidências
                  </span>
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => setEvidenceDialogOpen(true)}
                    >
                      <Paperclip className="h-3 w-3" />
                      Anexar
                    </Button>
                  )}
                </div>

                {(task.evidences?.length || 0) > 0 ? (
                  <div className="space-y-1">
                    {task.evidences?.map((evidence) => {
                      const EvidenceIcon = getEvidenceIcon(evidence);
                      return (
                        <div
                          key={evidence.id}
                          className="flex items-center gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors group"
                        >
                          <EvidenceIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate flex-1">{evidence.title}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => window.open(evidence.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            {!disabled && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteEvidence(evidence.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Nenhuma evidência anexada.
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </CardContent>
        </Collapsible>
      </Card>

      <TaskEvidenceDialog
        open={evidenceDialogOpen}
        onOpenChange={setEvidenceDialogOpen}
        onAddEvidence={handleAddEvidence}
      />
    </>
  );
}
