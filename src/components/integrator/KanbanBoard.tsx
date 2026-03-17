import { useState, useMemo } from 'react';
import { LayoutGrid, List, Filter, Paperclip, X } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { KanbanColumn } from './KanbanColumn';
import { KanbanListView } from './KanbanListView';
import { KanbanTask, columnConfig } from '@/data/integratorMockData';

interface KanbanBoardProps {
  disabled?: boolean;
  tasks: KanbanTask[];
  onUpdateTasks: (tasks: KanbanTask[]) => void;
}

type ViewMode = 'columns' | 'list';
type StatusFilter = 'all' | KanbanTask['status'];
type ColumnFilter = 'all' | KanbanTask['column'];

export function KanbanBoard({ disabled = false, tasks, onUpdateTasks }: KanbanBoardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('columns');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [columnFilter, setColumnFilter] = useState<ColumnFilter>('all');
  const [onlyWithEvidence, setOnlyWithEvidence] = useState(false);
  
  const columns = ['planning', 'research', 'execution', 'review', 'delivery'] as const;

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (columnFilter !== 'all' && task.column !== columnFilter) return false;
      if (onlyWithEvidence && task.evidences.length === 0) return false;
      return true;
    });
  }, [tasks, statusFilter, columnFilter, onlyWithEvidence]);

  const hasActiveFilters = statusFilter !== 'all' || columnFilter !== 'all' || onlyWithEvidence;

  const clearFilters = () => {
    setStatusFilter('all');
    setColumnFilter('all');
    setOnlyWithEvidence(false);
  };

  const handleUpdateTask = (updatedTask: KanbanTask) => {
    onUpdateTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  return (
    <div className="space-y-4">
      {/* Filters and View Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="todo">A fazer</SelectItem>
              <SelectItem value="in_progress">Em progresso</SelectItem>
              <SelectItem value="done">Concluído</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Column Filter (only in list view) */}
          {viewMode === 'list' && (
            <Select value={columnFilter} onValueChange={(value) => setColumnFilter(value as ColumnFilter)}>
              <SelectTrigger className="w-[160px] h-8">
                <SelectValue placeholder="Etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as etapas</SelectItem>
                <SelectItem value="planning">Planejamento</SelectItem>
                <SelectItem value="research">Pesquisa</SelectItem>
                <SelectItem value="execution">Execução</SelectItem>
                <SelectItem value="review">Revisão</SelectItem>
                <SelectItem value="delivery">Entrega</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {/* Evidence Filter */}
          <div className="flex items-center gap-2">
            <Checkbox 
              id="evidence-filter" 
              checked={onlyWithEvidence}
              onCheckedChange={(checked) => setOnlyWithEvidence(checked === true)}
            />
            <Label htmlFor="evidence-filter" className="text-sm flex items-center gap-1 cursor-pointer">
              <Paperclip className="h-3.5 w-3.5" />
              Com evidências
            </Label>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-muted-foreground">
              <X className="h-3.5 w-3.5 mr-1" />
              Limpar
            </Button>
          )}

          {/* Task Count */}
          <span className="text-xs text-muted-foreground ml-2">
            {filteredTasks.length} de {tasks.length} tarefas
          </span>
        </div>

        {/* View Mode Toggle */}
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(value) => value && setViewMode(value as ViewMode)}
          className="border rounded-lg p-1"
        >
          <ToggleGroupItem value="list" aria-label="Visualização em lista" className="h-8 px-3">
            <List className="h-4 w-4 mr-2" />
            <span className="text-sm">Lista</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="columns" aria-label="Visualização em colunas" className="h-8 px-3">
            <LayoutGrid className="h-4 w-4 mr-2" />
            <span className="text-sm">Colunas</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Kanban Content */}
      {viewMode === 'columns' ? (
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4 min-w-max">
            {columns.map((columnId) => {
              const config = columnConfig[columnId];
              const columnTasks = filteredTasks.filter(task => task.column === columnId);
              
              return (
                <KanbanColumn
                  key={columnId}
                  columnId={columnId}
                  label={config.label}
                  colorClass={config.color}
                  tasks={columnTasks}
                  onUpdateTask={handleUpdateTask}
                  disabled={disabled}
                />
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <KanbanListView
          tasks={filteredTasks}
          onUpdateTask={handleUpdateTask}
          disabled={disabled}
        />
      )}
    </div>
  );
}
