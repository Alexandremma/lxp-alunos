import type { CertificatePrintPayload } from "@/lib/certificatePrint"
import { buildCertificateValidationUrl } from "@/lib/certificatePublicUrls"
import { generateValidationQrDataUrl } from "@/lib/certificateQr"

async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { mode: "cors" })
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/** Converte URLs públicas em data URLs e gera QR de validação para impressão/PDF. */
export async function embedCertificatePrintImages(
  payload: CertificatePrintPayload,
): Promise<CertificatePrintPayload> {
  const institutionLogoUrl = payload.institutionLogoUrl?.trim()
    ? (await urlToDataUrl(payload.institutionLogoUrl)) ?? payload.institutionLogoUrl
    : payload.institutionLogoUrl

  const signatures = payload.signatures
    ? await Promise.all(
        payload.signatures.map(async (sig) => {
          if (!sig.imageUrl?.trim()) return sig
          const embedded = await urlToDataUrl(sig.imageUrl)
          return { ...sig, imageUrl: embedded ?? sig.imageUrl }
        }),
      )
    : payload.signatures

  const validationUrl =
    payload.validationUrl?.trim() ||
    (payload.validationCode ? buildCertificateValidationUrl(payload.validationCode) : "")

  const qrCodeDataUrl =
    payload.qrCodeDataUrl ||
    (validationUrl ? await generateValidationQrDataUrl(validationUrl) : undefined)

  return {
    ...payload,
    institutionLogoUrl,
    signatures,
    validationUrl,
    qrCodeDataUrl,
  }
}
