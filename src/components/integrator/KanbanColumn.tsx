import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardList, Lightbulb, Hammer, Search, CheckCircle } from 'lucide-react';
import { KanbanTask } from '@/data/integratorMockData';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  columnId: 'planning' | 'research' | 'execution' | 'review' | 'delivery';
  label: string;
  colorClass: string;
  tasks: KanbanTask[];
  onUpdateTask: (task: KanbanTask) => void;
  disabled?: boolean;
}

const iconMap = {
  planning: ClipboardList,
  research: Lightbulb,
  execution: Hammer,
  review: Search,
  delivery: CheckCircle
};

export function KanbanColumn({
  columnId,
  label,
  colorClass,
  tasks,
  onUpdateTask,
  disabled = false
}: KanbanColumnProps) {
  const Icon = iconMap[columnId];

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] bg-muted/30 rounded-lg border border-border/50">
      {/* Column Header */}
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${colorClass}`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">{label}</h3>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdateTask={onUpdateTask}
              disabled={disabled}
            />
          ))}
        </div>
      </ScrollArea>

    </div>
  );
}
