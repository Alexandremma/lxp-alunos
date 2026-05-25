import { useParams, Link } from "react-router-dom";
import { Download, ArrowLeft, Award, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { QueryStateCard } from "@/components/states/QueryStateCard";
import { useAuth } from "@/hooks/use-auth";
import { useCertificateDetail } from "@/hooks/queries/useCertificateDetail";
import { downloadCertificatePdf } from "@/services/certificatePdfService";
import { toast } from "sonner";

export default function Certificate() {
  const { courseId } = useParams<{ courseId: string }>();
  const { profile } = useAuth();
  const { data, isLoading, error, refetch } = useCertificateDetail(profile?.id, courseId);

  const handleDownload = () => {
    if (!data) return;
    try {
      downloadCertificatePdf(data);
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
            <Button onClick={handleDownload} className="gap-2" disabled={!data}>
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
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary h-32 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Award className="h-16 w-16 text-white/20" />
                </div>
              </div>

              <div className="p-8 md:p-12 text-center space-y-8 bg-card">
                {data.institutionLogoUrl && (
                  <img
                    src={data.institutionLogoUrl}
                    alt={data.institutionName}
                    className="h-14 mx-auto object-contain"
                  />
                )}
                <p className="text-sm uppercase tracking-widest text-primary font-semibold">
                  {data.institutionName}
                </p>

                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                    Certificado de Conclusão
                  </h1>
                  <p className="text-lg text-muted-foreground">Certificamos que</p>
                </div>

                <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">
                  {data.studentName}
                </h2>

                <div className="space-y-2">
                  <p className="text-muted-foreground">concluiu com sucesso a disciplina</p>
                  <h3 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
                    {data.courseTitle}
                  </h3>
                  {data.workloadHours != null && data.workloadHours > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Carga horária: <strong>{data.workloadHours} horas</strong>
                    </p>
                  )}
                </div>

                <Separator className="my-8" />

                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Data de Emissão</p>
                    <p className="font-medium">
                      {new Date(data.issuedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Código do Certificado</p>
                    <p className="font-mono font-medium">{data.codeHash}</p>
                  </div>
                </div>

                <div className="pt-8 space-y-4">
                  <Separator />
                  <div className="grid md:grid-cols-2 gap-8">
                    {(data.signatures.length > 0
                      ? data.signatures
                      : [
                          { signerName: data.instructor, signerTitle: "Instrutor(a)", imageUrl: null },
                          { signerName: data.institutionName, signerTitle: "Instituição", imageUrl: null },
                        ]
                    ).map((sig) => (
                      <div key={`${sig.signerName}-${sig.signerTitle}`} className="space-y-2">
                        {sig.imageUrl ? (
                          <img
                            src={sig.imageUrl}
                            alt=""
                            className="h-16 mx-auto object-contain"
                          />
                        ) : (
                          <div className="h-16 border-b-2 border-foreground/20" />
                        )}
                        <p className="text-sm text-muted-foreground">{sig.signerName}</p>
                        <p className="text-xs text-muted-foreground">{sig.signerTitle}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Valide em{" "}
                  <Link to={data.validationUrl} className="text-primary hover:underline font-mono">
                    {data.validationUrl}
                  </Link>
                </p>
              </div>
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
