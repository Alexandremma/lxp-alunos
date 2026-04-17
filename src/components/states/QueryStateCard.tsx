import type { LucideIcon } from "lucide-react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QueryStateCardProps = {
  state: "loading" | "error" | "empty";
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  className?: string;
};

const stateStyles: Record<QueryStateCardProps["state"], { iconColor: string }> = {
  loading: { iconColor: "text-muted-foreground/60" },
  error: { iconColor: "text-destructive/70" },
  empty: { iconColor: "text-muted-foreground/60" },
};

export function QueryStateCard({
  state,
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
  className,
}: QueryStateCardProps) {
  const iconColor = stateStyles[state].iconColor;
  const ResolvedIcon = Icon ?? AlertCircle;

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {state === "loading" ? (
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground/60 mb-4" />
        ) : (
          <ResolvedIcon className={cn("h-10 w-10 mb-4", iconColor)} />
        )}
        <p className="font-medium mb-1">{title}</p>
        {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
        {actionLabel && onAction && (
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
