import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

export function ModerationModeBanner() {
  return (
    <Alert className="border-primary/30 bg-primary/5">
      <Shield className="h-4 w-4" />
      <AlertDescription>
        Modo moderação: você pode navegar pelas aulas, visualizar o conteúdo e gerenciar os
        comentários da discussão. Ações de progresso e gamificação estão desabilitadas.
      </AlertDescription>
    </Alert>
  );
}
