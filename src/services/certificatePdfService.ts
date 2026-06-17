import { certificateDetailToPrintPayload } from "@/lib/certificatePrint"
import { downloadCertificatePdfFile } from "@/lib/certificatePdfDownload"
import type { CertificateDetail } from "@/services/certificateService"

export async function downloadCertificatePdf(detail: CertificateDetail): Promise<void> {
  await downloadCertificatePdfFile(certificateDetailToPrintPayload(detail))
}
