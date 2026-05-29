import { cn } from "@/lib/utils"
import type { CertificatePrintSignature } from "@/lib/certificatePrint"

export type CertificateDocumentData = {
  studentName: string
  courseTitle: string
  issuedAt: string
  codeHash: string
  workloadHours: number | null
  instructor: string
  institutionName: string
  institutionLogoUrl: string | null
  signatures: CertificatePrintSignature[]
  validationUrl?: string
}

type CertificateDocumentProps = {
  data: CertificateDocumentData
  mode?: "screen" | "print"
  className?: string
}

function formatIssuedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

/**
 * Layout unificado do certificado (tela e impressão).
 * Em `screen`, pode ser envolvido por gradiente; em `print`, fundo branco.
 */
export function CertificateDocument({
  data,
  mode = "screen",
  className,
}: CertificateDocumentProps) {
  const isPrint = mode === "print"
  const sigs =
    data.signatures.length > 0
      ? data.signatures
      : [
          { signerName: data.instructor, signerTitle: "Instrutor(a)", imageUrl: null },
          { signerName: data.institutionName, signerTitle: "Instituição", imageUrl: null },
        ]

  return (
    <div
      className={cn(
        isPrint ? "bg-white text-[#111] p-8" : "bg-card text-foreground p-8 md:p-12",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-[820px] text-center",
          isPrint ? "border-[3px] border-double border-[#4c1d95] p-10 md:p-12" : "space-y-8",
        )}
      >
        {data.institutionLogoUrl && (
          <img
            src={data.institutionLogoUrl}
            alt={data.institutionName}
            className="h-14 mx-auto object-contain mb-4"
          />
        )}

        <p
          className={cn(
            "text-sm uppercase tracking-widest font-semibold mb-6",
            isPrint ? "text-[#4c1d95]" : "text-primary",
          )}
        >
          {data.institutionName}
        </p>

        <div className="space-y-2">
          <h1
            className={cn(
              "font-semibold tracking-wide",
              isPrint ? "text-[28px] text-[#111]" : "text-4xl md:text-5xl font-display font-bold",
            )}
          >
            Certificado de Conclusão
          </h1>
          <p className={cn("text-lg", isPrint ? "text-[#555]" : "text-muted-foreground")}>
            Certificamos que
          </p>
        </div>

        <h2
          className={cn(
            "font-bold my-6",
            isPrint ? "text-[32px] text-[#4c1d95]" : "text-3xl md:text-4xl font-display text-primary",
          )}
        >
          {data.studentName}
        </h2>

        <div className="space-y-2">
          <p className={cn(isPrint ? "text-[#555]" : "text-muted-foreground")}>
            concluiu com sucesso a disciplina
          </p>
          <h3
            className={cn(
              "font-semibold",
              isPrint ? "text-[22px] text-[#111]" : "text-2xl md:text-3xl font-display",
            )}
          >
            {data.courseTitle}
          </h3>
          {data.workloadHours != null && data.workloadHours > 0 && (
            <p className={cn("text-sm", isPrint ? "text-[#444]" : "text-muted-foreground")}>
              Carga horária: <strong>{data.workloadHours} horas</strong>
            </p>
          )}
        </div>

        <div
          className={cn(
            "grid md:grid-cols-2 gap-6 text-sm my-8",
            isPrint ? "text-[#444]" : "text-muted-foreground",
          )}
        >
          <div className="space-y-1">
            <p>Data de Emissão</p>
            <p className={cn("font-medium", !isPrint && "text-foreground")}>
              {formatIssuedDate(data.issuedAt)}
            </p>
          </div>
          <div className="space-y-1">
            <p>Código do Certificado</p>
            <p className={cn("font-mono font-medium", !isPrint && "text-foreground")}>
              {data.codeHash}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-border/40">
          {sigs.map((sig) => (
            <div key={`${sig.signerName}-${sig.signerTitle}`} className="space-y-2">
              {sig.imageUrl ? (
                <img
                  src={sig.imageUrl}
                  alt=""
                  className="h-16 mx-auto object-contain"
                />
              ) : (
                <div
                  className={cn(
                    "h-16 border-b-2 mx-4",
                    isPrint ? "border-[#333]" : "border-foreground/20",
                  )}
                />
              )}
              <p className={cn("text-sm", isPrint ? "text-[#666]" : "text-muted-foreground")}>
                {sig.signerName}
              </p>
              <p className={cn("text-xs", isPrint ? "text-[#666]" : "text-muted-foreground")}>
                {sig.signerTitle}
              </p>
            </div>
          ))}
        </div>

        {data.validationUrl && !isPrint && (
          <p className="text-xs text-muted-foreground pt-4">
            Valide em{" "}
            <span className="text-primary font-mono break-all">{data.validationUrl}</span>
          </p>
        )}
      </div>
    </div>
  )
}
