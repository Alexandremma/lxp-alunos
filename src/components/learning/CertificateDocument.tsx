import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { generateValidationQrDataUrl, QR_DISPLAY_PX } from "@/lib/certificateQr"
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
 * Layout unificado do certificado (tela e impressão) — A4 paisagem compacto.
 * Assinaturas: somente slots do template. Verificação: QR + código discretos à direita do rodapé.
 */
export function CertificateDocument({
  data,
  mode = "screen",
  className,
}: CertificateDocumentProps) {
  const isPrint = mode === "print"
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!data.validationUrl?.trim()) {
      setQrDataUrl(null)
      return
    }
    let cancelled = false
    void generateValidationQrDataUrl(data.validationUrl).then((url) => {
      if (!cancelled) setQrDataUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [data.validationUrl])

  return (
    <div
      className={cn(
        isPrint ? "bg-white text-[#111] p-4" : "bg-card text-foreground p-5 md:p-6",
        className,
      )}
    >
      <div
        className={cn(
          "relative mx-auto w-full max-w-[900px] text-center",
          isPrint
            ? "border-[3px] border-double border-[#4c1d95] px-8 py-6 pb-8"
            : "border-[3px] border-double border-[#4c1d95]/80 rounded-lg px-6 py-5 pb-7 md:px-8 md:py-6 md:pb-8",
        )}
      >
        <div className="space-y-1">
          {data.institutionLogoUrl && (
            <img
              src={data.institutionLogoUrl}
              alt={data.institutionName}
              className="h-10 mx-auto object-contain mb-2"
            />
          )}

          <p
            className={cn(
              "text-[11px] uppercase tracking-widest font-semibold mb-2",
              isPrint ? "text-[#4c1d95]" : "text-primary",
            )}
          >
            {data.institutionName}
          </p>

          <h1
            className={cn(
              "font-semibold tracking-wide",
              isPrint ? "text-[24px] text-[#111]" : "text-xl md:text-2xl font-display font-bold",
            )}
          >
            Certificado de Conclusão
          </h1>
          <p className={cn("text-sm", isPrint ? "text-[#555]" : "text-muted-foreground")}>
            Certificamos que
          </p>

          <h2
            className={cn(
              "font-bold my-2",
              isPrint ? "text-[28px] text-[#4c1d95]" : "text-xl md:text-2xl font-display text-primary",
            )}
          >
            {data.studentName}
          </h2>

          <p className={cn("text-sm", isPrint ? "text-[#555]" : "text-muted-foreground")}>
            concluiu com sucesso a disciplina
          </p>
          <h3
            className={cn(
              "font-semibold",
              isPrint ? "text-[18px] text-[#111]" : "text-lg md:text-xl font-display",
            )}
          >
            {data.courseTitle}
          </h3>

          {data.workloadHours != null && data.workloadHours > 0 && (
            <p className={cn("text-xs mt-1", isPrint ? "text-[#444]" : "text-muted-foreground")}>
              Carga horária: <strong>{data.workloadHours} horas</strong>
            </p>
          )}

          <p className={cn("text-xs mt-1", isPrint ? "text-[#444]" : "text-muted-foreground")}>
            Data de emissão:{" "}
            <span className={cn("font-medium", !isPrint && "text-foreground")}>
              {formatIssuedDate(data.issuedAt)}
            </span>
          </p>
        </div>

        {data.signatures.length > 0 && (
          <div className="mt-4 flex flex-row flex-nowrap justify-center items-end gap-10 md:gap-14">
            {data.signatures.map((sig) => (
              <div key={`${sig.signerName}-${sig.signerTitle}`} className="w-[130px] shrink-0 space-y-0.5">
                {sig.imageUrl ? (
                  <img src={sig.imageUrl} alt="" className="h-11 mx-auto object-contain" />
                ) : (
                  <div
                    className={cn(
                      "h-9 border-b-2 mx-2",
                      isPrint ? "border-[#333]" : "border-foreground/20",
                    )}
                  />
                )}
                <p className={cn("text-[11px] font-semibold", isPrint ? "text-[#333]" : "text-foreground")}>
                  {sig.signerName}
                </p>
                <p className={cn("text-[10px]", isPrint ? "text-[#666]" : "text-muted-foreground")}>
                  {sig.signerTitle}
                </p>
              </div>
            ))}
          </div>
        )}

        {data.validationUrl && (
          <div className="absolute right-3 bottom-2.5 text-center md:right-4 md:bottom-3">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Validação"
                className="mx-auto mb-0.5"
                style={{ width: QR_DISPLAY_PX, height: QR_DISPLAY_PX, imageRendering: "pixelated" }}
              />
            )}
            <p
              className={cn(
                "font-mono text-[8px] max-w-[88px] break-all leading-tight",
                isPrint ? "text-[#555]" : "text-muted-foreground",
              )}
            >
              {data.codeHash}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
