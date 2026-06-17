import QRCode from "qrcode"

/** Bitmap gerado em alta resolução; o CSS exibe menor, mas a câmera lê módulos nítidos. */
const QR_GENERATE_PX = 180

/** Tamanho de exibição sugerido (px) — mínimo ~15 mm no impresso para leitura confiável. */
export const QR_DISPLAY_PX = 58

/**
 * Gera PNG em data URL cujo conteúdo escaneado é a URL absoluta de validação.
 * Lib: `qrcode` (npm) — padrão de mercado para QR no browser, sem chamada de API externa.
 */
export async function generateValidationQrDataUrl(validationUrl: string): Promise<string> {
  const url = validationUrl.trim()
  if (!url) {
    throw new Error("URL de validação vazia — não é possível gerar QR.")
  }
  return QRCode.toDataURL(url, {
    width: QR_GENERATE_PX,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  })
}
