import {
  openCertificatePrintWindow,
  type CertificatePrintPayload,
} from "@/lib/certificatePrint";
import type { CertificateDetail } from "@/services/certificateService";

export function downloadCertificatePdf(detail: CertificateDetail): void {
  const payload: CertificatePrintPayload = {
    studentName: detail.studentName,
    disciplineName: detail.courseTitle,
    issuedAt: detail.issuedAt,
    validationCode: detail.codeHash,
    workloadHours: detail.workloadHours,
    instructorName: detail.instructor,
    institutionName: detail.institutionName,
    institutionLogoUrl: detail.institutionLogoUrl,
    signatures: detail.signatures,
    validateBaseUrl: window.location.origin,
    autoPrint: true,
  };
  openCertificatePrintWindow(payload);
}
