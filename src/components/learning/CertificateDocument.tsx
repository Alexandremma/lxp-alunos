import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { generateValidationQrDataUrl, QR_DISPLAY_PX } from "@/lib/certificateQr"
import type { CertificatePrintSignature, CertificateLayoutKind } from "@/lib/certificatePrint"

export type CertificateDocumentData = {
  studentName: string
  courseTitle: string
  issuedAt: string
  codeHash: string
  workloadHours: number | null
  instructor: string
  institutionName: string
  institutionLogoUrl: string | null
  layoutKind?: CertificateLayoutKind
  backgroundImageUrl?: string | null
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
 * Layout unificado do certificado (tela e impressão) — A4 paisagem.
 * Padrão: moldura preenche A4; bloco texto+assinaturas centralizado como unidade.
 * Personalizado: fundo em tela cheia com conteúdo centralizado.
 * Verificação: QR + código no canto inferior esquerdo (66px).
 */
export function CertificateDocument({
  data,
  mode = "screen",
  className,
}: CertificateDocumentProps) {
  const isPrint = mode === "print"
  const isCustom = data.layoutKind === "custom" && Boolean(data.backgroundImageUrl?.trim())
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

  const contentBlock = (
    <>
      {data.institutionLogoUrl && (
        <img
          src={data.institutionLogoUrl}
          alt={data.institutionName}
          className={cn(
            "mx-auto object-contain mb-2.5",
            isCustom ? "h-14 md:h-16" : "h-11",
          )}
        />
      )}

      <p
        className={cn(
          "uppercase tracking-widest font-semibold mb-3",
          isCustom ? "text-sm md:text-base" : "text-xs",
          isPrint ? "text-[#4c1d95]" : "text-primary",
        )}
      >
        {data.institutionName}
      </p>

      {!isCustom && (
        <h1
          className={cn(
            "font-semibold tracking-wide",
            isPrint ? "text-[26px] text-[#111]" : "text-2xl md:text-3xl font-display font-bold",
          )}
        >
          Certificado de Conclusão
        </h1>
      )}
      <p
        className={cn(
          isCustom ? "text-lg" : "text-base",
          isPrint ? "text-[#555]" : "text-muted-foreground",
        )}
      >
        Certificamos que
      </p>

      <h2
        className={cn(
          "font-bold my-3",
          isCustom
            ? isPrint
              ? "text-[38px] text-[#4c1d95]"
              : "text-4xl md:text-[2.75rem] font-display text-primary"
            : isPrint
              ? "text-[32px] text-[#4c1d95]"
              : "text-2xl md:text-3xl font-display text-primary",
        )}
      >
        {data.studentName}
      </h2>

      <p
        className={cn(
          isCustom ? "text-lg" : "text-base",
          isPrint ? "text-[#555]" : "text-muted-foreground",
        )}
      >
        concluiu com sucesso a disciplina
      </p>
      <h3
        className={cn(
          "font-semibold",
          isCustom
            ? isPrint
              ? "text-[24px] text-[#111]"
              : "text-2xl md:text-3xl font-display"
            : isPrint
              ? "text-[21px] text-[#111]"
              : "text-xl md:text-2xl font-display",
        )}
      >
        {data.courseTitle}
      </h3>

      {data.workloadHours != null && data.workloadHours > 0 && (
        <p
          className={cn(
            "mt-1.5",
            isCustom ? "text-base" : "text-sm",
            isPrint ? "text-[#444]" : "text-muted-foreground",
          )}
        >
          Carga horária: <strong>{data.workloadHours} horas</strong>
        </p>
      )}

      <p
        className={cn(
          "mt-1.5",
          isCustom ? "text-base" : "text-sm",
          isPrint ? "text-[#444]" : "text-muted-foreground",
        )}
      >
        Data de emissão:{" "}
        <span className={cn("font-medium", !isPrint && "text-foreground")}>
          {formatIssuedDate(data.issuedAt)}
        </span>
      </p>

      {data.signatures.length > 0 && (
        <div
          className={cn(
            "mt-4 flex flex-row flex-nowrap justify-center items-end",
            isCustom ? "gap-12 md:gap-16" : "gap-10 md:gap-14",
          )}
        >
          {data.signatures.map((sig) => (
            <div
              key={`${sig.signerName}-${sig.signerTitle}`}
              className={cn("shrink-0 space-y-0.5", isCustom ? "w-[145px]" : "w-[130px]")}
            >
              {sig.imageUrl ? (
                <img
                  src={sig.imageUrl}
                  alt=""
                  className={cn("mx-auto object-contain", isCustom ? "h-12" : "h-11")}
                />
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
    </>
  )

  const verifyBlock = data.validationUrl ? (
    <div className="absolute left-3 bottom-2.5 z-[2] text-center md:left-4 md:bottom-3">
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
          "font-mono text-[11px] max-w-[150px] break-all leading-tight",
          isPrint ? "text-[#555]" : "text-muted-foreground",
        )}
      >
        {data.codeHash}
      </p>
    </div>
  ) : null

  return (
    <div
      className={cn(
        isPrint ? "bg-white text-[#111] p-4" : "bg-card text-foreground p-5 md:p-6",
        className,
      )}
    >
      {isCustom ? (
        <div
          className="relative mx-auto flex w-full max-w-[900px] aspect-[297/210] flex-col justify-center bg-cover bg-center bg-no-repeat text-center pt-[25%] pb-[18%] px-[3.5%]"
          style={{ backgroundImage: `url(${data.backgroundImageUrl})` }}
        >
          <div className="pointer-events-none absolute inset-0 bg-white/5" aria-hidden />
          <div className="relative z-[1] w-full space-y-1">{contentBlock}</div>
          {verifyBlock}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[900px] aspect-[297/210] p-2.5">
          <div
            className={cn(
              "relative flex h-full w-full flex-col justify-center text-center px-5 py-4 md:px-6",
              isPrint
                ? "border-[3px] border-double border-[#4c1d95]"
                : "border-[3px] border-double border-[#4c1d95]/80 rounded-lg",
            )}
          >
            <div className="space-y-1">{contentBlock}</div>
            {verifyBlock}
          </div>
        </div>
      )}
    </div>
  )
}
