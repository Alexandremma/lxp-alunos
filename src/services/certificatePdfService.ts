import {
  certificateDetailToPrintPayload,
  openCertificatePrintWindow,
} from "@/lib/certificatePrint";
import type { CertificateDetail } from "@/services/certificateService";

export async function downloadCertificatePdf(detail: CertificateDetail): Promise<void> {
  await openCertificatePrintWindow({
    ...certificateDetailToPrintPayload(detail),
    validateBaseUrl: window.location.origin,
    autoPrint: true,
  });
}
