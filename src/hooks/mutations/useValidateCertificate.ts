import { useMutation } from "@tanstack/react-query"
import {
  validateCertificateByCode,
  type PublicCertificateValidationResult,
} from "@/services/certificateValidationService"

export function useValidateCertificate() {
  return useMutation({
    mutationFn: (code: string): Promise<PublicCertificateValidationResult> =>
      validateCertificateByCode(code),
  })
}
