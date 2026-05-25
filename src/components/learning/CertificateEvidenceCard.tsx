import { useState } from "react"
import { Download, GraduationCap, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

import type { LearningEvidence } from "@/types/learningEvidence"
import { useAuth } from "@/hooks/use-auth"
import { getCertificateDetail } from "@/services/certificateService"
import { downloadCertificatePdf } from "@/services/certificatePdfService"

type CertificateEvidenceCardProps = {
  evidence: LearningEvidence
  className?: string
}

export function CertificateEvidenceCard({ evidence, className }: CertificateEvidenceCardProps) {
  const { profile } = useAuth()
  const [downloading, setDownloading] = useState(false)
  const courseDisciplineId = evidence.trailId

  const handleDownload = async () => {
    if (!profile?.id || !courseDisciplineId) return
    try {
      setDownloading(true)
      const detail = await getCertificateDetail({
        profileId: profile.id,
        courseDisciplineId,
      })
      if (!detail) {
        toast.error("Certificado indisponível. Conclua todas as aulas primeiro.")
        return
      }
      downloadCertificatePdf(detail)
      toast.success("Use a janela de impressão para salvar em PDF.")
    } catch (err) {
      console.error(err)
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Não foi possível gerar o certificado."
      toast.error(message)
    } finally {
      setDownloading(false)
    }
  }

  const titleClean = evidence.title.replace(/^Certificado\s*-\s*/i, "").trim() || evidence.title

  return (
    <Card className={cn("overflow-hidden card-hover group", className)}>
      <div className="relative h-32 bg-gradient-to-br from-warning/20 via-warning/10 to-primary/10 flex items-center justify-center">
        <GraduationCap className="h-14 w-14 text-warning/70" />
        <Badge variant="secondary" className="absolute top-3 left-3 bg-warning/10 text-warning">
          Certificado
        </Badge>
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2">{titleClean}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Concluído em{" "}
            {format(parseISO(evidence.earnedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <Button
          className="w-full gap-2"
          onClick={() => void handleDownload()}
          disabled={downloading || !courseDisciplineId}
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Baixar certificado
        </Button>
      </CardContent>
    </Card>
  )
}
