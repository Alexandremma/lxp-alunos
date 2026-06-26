import { cn } from "@/lib/utils";

type LoadingDotsProps = {
  className?: string;
};

/** Indicador de carregamento (três pontos) — identidade B42. Espelhar em lxp-backoffice. */
export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn("flex gap-1.5", className)} aria-hidden>
      <span className="h-2 w-2 rounded-full bg-primary motion-safe:animate-bounce [animation-delay:-0.3s]" />
      <span className="h-2 w-2 rounded-full bg-primary motion-safe:animate-bounce [animation-delay:-0.15s]" />
      <span className="h-2 w-2 rounded-full bg-primary motion-safe:animate-bounce" />
    </div>
  );
}
