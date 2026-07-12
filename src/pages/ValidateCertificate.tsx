import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Award, CheckCircle2, XCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/states/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { PublicCertificateValidation } from "@/services/certificateValidationService";
import { useValidateCertificate } from "@/hooks/mutations/useValidateCertificate";

export default function ValidateCertificate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get("code") ?? "";
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<PublicCertificateValidation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const validateMutation = useValidateCertificate();

  const runValidation = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setResult(null);
      setErrorMessage("Informe o código impresso no certificado.");
      return;
    }
    setErrorMessage(null);
    setResult(null);
    try {
      const res = await validateMutation.mutateAsync(trimmed);
      if (res.valid) {
        setResult(res);
        setSearchParams({ code: res.validationCode }, { replace: true });
      } else {
        setErrorMessage(res.message);
        setSearchParams({ code: trimmed }, { replace: true });
      }
    } catch {
      setErrorMessage("Não foi possível validar o código. Tente novamente.");
    }
  };

  useEffect(() => {
    if (initialCode.trim()) {
      void runValidation(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount with URL code
  }, []);

  const loading = validateMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-primary/10">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold">Validar certificado</h1>
          <p className="text-sm text-muted-foreground">
            Informe o código único impresso no documento para confirmar a autenticidade.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Código de validação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="B42-XXXXXXXX"
                className="font-mono"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => void runValidation(code)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Validando…
                </>
              ) : (
                "Validar"
              )}
            </Button>
          </CardContent>
        </Card>

        {loading && (
          <p className="text-center text-sm text-muted-foreground">Consultando registro…</p>
        )}

        {errorMessage && !loading && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6 flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Certificado não validado</p>
                <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {result && !loading && (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Certificado autêntico</span>
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Aluno(a)</dt>
                  <dd className="font-medium">{result.studentName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Disciplina</dt>
                  <dd className="font-medium">{result.disciplineName}</dd>
                </div>
                {result.workloadHours != null && result.workloadHours > 0 && (
                  <div>
                    <dt className="text-muted-foreground">Carga horária</dt>
                    <dd className="font-medium">{result.workloadHours} horas</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">Data de emissão</dt>
                  <dd className="font-medium">
                    {new Date(result.issuedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Código</dt>
                  <dd className="font-mono text-xs">{result.validationCode}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">
            Acessar portal do aluno
          </Link>
        </p>
      </div>
    </div>
  );
}
