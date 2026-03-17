import { useState } from "react";
import { Check, Circle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Activity } from "@/data/mockData";
import { format, isPast, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityChecklistProps {
  activities: Activity[];
  className?: string;
  onToggle?: (id: string, completed: boolean) => void;
}

export const ActivityChecklist = ({
  activities,
  className,
  onToggle,
}: ActivityChecklistProps) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    new Set(activities.filter((a) => a.status === "completed").map((a) => a.id))
  );

  const handleToggle = (id: string) => {
    const newChecked = new Set(checkedItems);
    const isNowChecked = !newChecked.has(id);
    
    if (isNowChecked) {
      newChecked.add(id);
    } else {
      newChecked.delete(id);
    }
    
    setCheckedItems(newChecked);
    onToggle?.(id, isNowChecked);
  };

  const getStatusIcon = (activity: Activity, isChecked: boolean) => {
    if (isChecked) {
      return (
        <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center animate-scale-in">
          <Check className="w-3 h-3 text-success-foreground" />
        </div>
      );
    }

    if (activity.dueDate && isPast(parseISO(activity.dueDate)) && activity.status !== "completed") {
      return <AlertCircle className="w-5 h-5 text-destructive" />;
    }

    return (
      <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
    );
  };

  const typeLabels = {
    lesson: "Aula",
    quiz: "Quiz",
    project: "Projeto",
    deadline: "Prazo",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {activities.map((activity) => {
        const isChecked = checkedItems.has(activity.id);
        const isOverdue = activity.dueDate && 
          isPast(parseISO(activity.dueDate)) && 
          !isChecked;

        return (
          <button
            key={activity.id}
            onClick={() => handleToggle(activity.id)}
            className={cn(
              "w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left",
              "hover:bg-muted/50",
              isChecked && "opacity-60"
            )}
          >
            {/* Checkbox */}
            <div className="mt-0.5 flex-shrink-0">
              {getStatusIcon(activity, isChecked)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "font-medium text-sm",
                  isChecked && "line-through text-muted-foreground"
                )}
              >
                {activity.title}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="px-1.5 py-0.5 rounded bg-muted">
                  {typeLabels[activity.type]}
                </span>
                <span>{activity.trailTitle}</span>
              </div>
            </div>

            {/* Due date */}
            {activity.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs flex-shrink-0",
                  isOverdue ? "text-destructive" : "text-muted-foreground"
                )}
              >
                <Clock className="w-3 h-3" />
                <span>
                  {format(parseISO(activity.dueDate), "dd MMM", { locale: ptBR })}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
