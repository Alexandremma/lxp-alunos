import { Progress } from "@/components/ui/progress";
import { clampProgressPercent } from "@/lib/progressPercent";
import { cn } from "@/lib/utils";

type LearningProgressBarProps = {
  value: number;
  label?: string;
  /** Right-side caption; defaults to `${percent}%`. */
  suffix?: string;
  className?: string;
  barClassName?: string;
};

export function LearningProgressBar({
  value,
  label = "Progresso",
  suffix,
  className,
  barClassName,
}: LearningProgressBarProps) {
  const percent = clampProgressPercent(value);
  const suffixText = suffix ?? `${percent}%`;

  return (
    <div className={className}>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{suffixText}</span>
      </div>
      <Progress value={percent} className={cn("h-2", barClassName)} />
    </div>
  );
}
