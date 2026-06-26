import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/states/LoadingSpinner";
import { cn } from "@/lib/utils";

export type PageLoadingVariant = "inline" | "card" | "section" | "fullscreen";

type PageLoadingStateProps = {
  title: string;
  description?: string;
  variant?: PageLoadingVariant;
  className?: string;
};

/** Estado de carregamento de página/seção — espelhar em lxp-backoffice. */
export function PageLoadingState({
  title,
  description,
  variant = "section",
  className,
}: PageLoadingStateProps) {
  if (variant === "inline") {
    return (
      <div
        className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <LoadingSpinner size="sm" />
        <span>{title}</span>
      </div>
    );
  }

  const body = (
    <div className="flex flex-col items-center justify-center text-center gap-3">
      <LoadingSpinner size={variant === "fullscreen" ? "lg" : "md"} />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );

  if (variant === "card") {
    return (
      <Card className={className} role="status" aria-live="polite" aria-busy="true">
        <CardContent className="py-12">{body}</CardContent>
      </Card>
    );
  }

  if (variant === "fullscreen") {
    return (
      <div
        className={cn("min-h-screen flex items-center justify-center bg-background px-6", className)}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {body}
      </div>
    );
  }

  return (
    <div className={cn("py-12", className)} role="status" aria-live="polite" aria-busy="true">
      {body}
    </div>
  );
}
