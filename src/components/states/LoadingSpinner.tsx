import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-10 w-10",
} as const;

type LoadingSpinnerProps = {
  size?: keyof typeof sizeClasses;
  className?: string;
};

/** Spinner padronizado (cor primary). Espelhar em lxp-backoffice. */
export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn(sizeClasses[size], "animate-spin text-primary", className)}
      aria-hidden
    />
  );
}
