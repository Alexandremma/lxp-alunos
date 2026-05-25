import { Link } from "react-router-dom";
import { Award, Download, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type TrailCertificateCardProps = {
  trailId: string;
  ready: boolean;
  workloadHours?: number | null;
  onDownload: () => void;
  isDownloading?: boolean;
};

export function TrailCertificateCard({
  trailId,
  ready,
  workloadHours,
  onDownload,
  isDownloading,
}: TrailCertificateCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="h-4 w-4 text-warning" />
          Certificado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {workloadHours != null && workloadHours > 0 && (
          <p className="text-xs text-muted-foreground">
            Carga horária registrada: <strong>{workloadHours}h</strong>
          </p>
        )}
        {!ready ? (
          <>
            <Badge variant="outline" className="text-muted-foreground">
              Conclua todas as aulas para liberar
            </Badge>
            <Button className="w-full" disabled>
              Baixar certificado
            </Button>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Seu certificado está disponível. O PDF inclui código de validação pública.
            </p>
            <Button
              className="w-full gap-2"
              onClick={onDownload}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Gerando PDF…" : "Baixar certificado"}
            </Button>
            <Button variant="outline" className="w-full gap-2" asChild>
              <Link to={`/certificado/${trailId}`}>
                <ExternalLink className="h-4 w-4" />
                Ver certificado na tela
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
