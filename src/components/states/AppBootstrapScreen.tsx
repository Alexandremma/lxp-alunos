import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

type AppBootstrapScreenProps = {
  message?: string;
  className?: string;
};

/**
 * Tela de bootstrap de rota (auth / permissões). Primeiro passo para loading
 * centralizado — ver docs-central § loading UI padronizado (follow-up).
 */
export function AppBootstrapScreen({
  message = "Preparando sua área de estudo…",
  className,
}: AppBootstrapScreenProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted/40 px-6",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-primary/15 blur-2xl motion-safe:animate-pulse" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-card shadow-lg">
          <GraduationCap className="h-8 w-8 text-primary" aria-hidden />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-primary motion-safe:animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-primary motion-safe:animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-primary motion-safe:animate-bounce" />
        </div>
        <p className="text-sm font-medium text-foreground/80">{message}</p>
      </div>
    </div>
  );
}
