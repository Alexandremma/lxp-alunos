import { GraduationCap } from "lucide-react";
import { LoadingDots } from "@/components/states/LoadingDots";
import { cn } from "@/lib/utils";

type AppBootstrapScreenProps = {
  message?: string;
  className?: string;
};

/** Bootstrap de rota (auth / permissões). Espelhar em lxp-backoffice. */
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
        <LoadingDots />
        <p className="text-sm font-medium text-foreground/80">{message}</p>
      </div>
    </div>
  );
}
