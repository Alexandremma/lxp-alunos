import { useParams, Link } from "react-router-dom";
import { Download, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QueryStateCard } from "@/components/states/QueryStateCard";
import { useAuth } from "@/hooks/use-auth";
import { useCertificateDetail } from "@/hooks/queries/useCertificateDetail";
import { downloadCertificatePdf } from "@/services/certificatePdfService";
import { CertificateDocument } from "@/components/learning/CertificateDocument";
import { toast } from "sonner";

export default function Certificate() {
  const { courseId } = useParams<{ courseId: string }>();
  const { profile } = useAuth();
  const { data, isLoading, error, refetch } = useCertificateDetail(profile?.id, courseId);

  const handleDownload = async () => {
    if (!data) return;
    try {
      await downloadCertificatePdf(data);
      toast.success("Use a janela de impressão para salvar em PDF.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Não foi possível abrir a impressão.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link to="/portfolio">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" asChild disabled={!data}>
              <a href={data ? data.validationUrl : "#"} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Página de validação pública
              </a>
            </Button>
            <Button onClick={() => void handleDownload()} className="gap-2" disabled={!data}>
              <Download className="h-4 w-4" />
              Baixar certificado
            </Button>
          </div>
        </div>

        {isLoading ? (
          <QueryStateCard state="loading" title="Carregando certificado..." />
        ) : error ? (
          <QueryStateCard
            state="error"
            title="Não foi possível carregar o certificado."
            description="Tente novamente para buscar os dados atualizados."
            actionLabel="Tentar novamente"
            onAction={() => void refetch()}
          />
        ) : !data ? (
          <QueryStateCard
            state="empty"
            title="Certificado indisponível"
            description="Este certificado só fica disponível após concluir a disciplina."
          />
        ) : (
          <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl">
            <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary h-24 relative overflow-hidden" />
            <CardContent className="p-0 -mt-2">
              <CertificateDocument
                mode="screen"
                data={{
                  studentName: data.studentName,
                  courseTitle: data.courseTitle,
                  issuedAt: data.issuedAt,
                  codeHash: data.codeHash,
                  workloadHours: data.workloadHours,
                  instructor: data.instructor,
                  institutionName: data.institutionName,
                  institutionLogoUrl: data.institutionLogoUrl,
                  signatures: data.signatures,
                  validationUrl: data.validationUrl,
                }}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Sobre este certificado</h3>
              <p className="text-sm text-muted-foreground">
                O PDF usa os dados gravados no momento da emissão (snapshot imutável). Qualquer
                pessoa pode confirmar a autenticidade pela página pública de validação.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
