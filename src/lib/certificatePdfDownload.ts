import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import {
  A4_LANDSCAPE_HEIGHT_PX,
  A4_LANDSCAPE_WIDTH_PX,
} from "@/lib/certificateDimensions"
import { embedCertificatePrintImages } from "@/lib/certificateImageEmbed"
import { buildCertificatePrintHtml, type CertificatePrintPayload } from "@/lib/certificatePrint"

const CANVAS_SCALE = 2

function waitForImages(doc: Document): Promise<void> {
  const imgs = Array.from(doc.images ?? [])
  if (!imgs.length) return Promise.resolve()
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) resolve()
          else {
            img.onload = () => resolve()
            img.onerror = () => resolve()
          }
        }),
    ),
  ).then(() => undefined)
}

function sanitizeFilename(name: string): string {
  const base = name.replace(/[^\w.-]+/g, "_").replace(/_+/g, "_")
  return base.endsWith(".pdf") ? base : `${base}.pdf`
}

/** Gera e baixa PDF A4 paisagem a partir do mesmo HTML do certificado (sem diálogo de impressão). */
export async function downloadCertificatePdfFile(
  payload: CertificatePrintPayload,
  filename?: string,
): Promise<void> {
  const embedded = await embedCertificatePrintImages(payload)
  const html = buildCertificatePrintHtml({ ...embedded, autoPrint: false })

  const iframe = document.createElement("iframe")
  iframe.setAttribute("aria-hidden", "true")
  iframe.style.cssText = `position:fixed;left:-10000px;top:0;width:${A4_LANDSCAPE_WIDTH_PX}px;height:${A4_LANDSCAPE_HEIGHT_PX}px;border:none;`
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  if (!doc) {
    document.body.removeChild(iframe)
    throw new Error("Não foi possível renderizar o certificado para PDF.")
  }

  try {
    doc.open()
    doc.write(html)
    doc.close()

    await new Promise<void>((resolve) => {
      if (doc.readyState === "complete") resolve()
      else iframe.onload = () => resolve()
    })
    await new Promise((r) => setTimeout(r, 100))
    await waitForImages(doc)

    const sheet = doc.querySelector(".sheet")
    if (!sheet) {
      throw new Error("Layout do certificado não encontrado.")
    }

    const canvas = await html2canvas(sheet as HTMLElement, {
      scale: CANVAS_SCALE,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: A4_LANDSCAPE_WIDTH_PX,
      height: A4_LANDSCAPE_HEIGHT_PX,
    })

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgW = canvas.width / CANVAS_SCALE
    const imgH = canvas.height / CANVAS_SCALE
    const fitScale = Math.min(pageW / imgW, pageH / imgH)
    const renderW = imgW * fitScale
    const renderH = imgH * fitScale
    const offsetX = (pageW - renderW) / 2
    const offsetY = (pageH - renderH) / 2

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      offsetX,
      offsetY,
      renderW,
      renderH,
    )

    const defaultName = `certificado-${payload.validationCode.trim()}`
    pdf.save(sanitizeFilename(filename ?? defaultName))
  } finally {
    document.body.removeChild(iframe)
  }
}
