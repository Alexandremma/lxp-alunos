import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg" | "xl";
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  color?: "primary" | "secondary" | "success";
}

const sizeMap = {
  sm: 40,
  md: 60,
  lg: 80,
  xl: 120,
};

const strokeWidthMap = {
  sm: 4,
  md: 5,
  lg: 6,
  xl: 8,
};

const textSizeMap = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
  xl: "text-2xl",
};

const colorMap = {
  primary: "stroke-primary",
  secondary: "stroke-secondary",
  success: "stroke-success",
};

export const ProgressRing = ({
  progress,
  size = "md",
  strokeWidth,
  className,
  showPercentage = true,
  color = "primary",
}: ProgressRingProps) => {
  const dimension = sizeMap[size];
  const stroke = strokeWidth || strokeWidthMap[size];
  const radius = (dimension - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={dimension}
        height={dimension}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        {/* Progress circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(colorMap[color], "transition-all duration-500 ease-out")}
        />
      </svg>
      {showPercentage && (
        <span
          className={cn(
            "absolute font-semibold text-foreground",
            textSizeMap[size]
          )}
        >
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};
