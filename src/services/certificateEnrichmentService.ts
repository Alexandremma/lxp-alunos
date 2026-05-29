import { supabase } from "@/lib/supabaseClient"
import {
  certificateSignaturePublicUrl,
  type CertificateSnapshot,
} from "@/services/certificateIssueService"

type TemplateMediaRow = {
  institution_name: string | null
  institution_logo_path: string | null
}

type SlotMediaRow = {
  slot: number
  lxp_certificate_signatures: {
    signer_name: string
    signer_title: string
    image_path: string | null
  } | null
}

/**
 * Preenche logo/instituição/imagens de assinatura ausentes no snapshot a partir do template.
 */
export async function enrichCertificateSnapshot(
  snapshot: CertificateSnapshot,
  templateId: string | null,
): Promise<CertificateSnapshot> {
  if (!templateId) return snapshot

  const enriched: CertificateSnapshot = {
    ...snapshot,
    signatures: (snapshot.signatures ?? []).map((s) => ({ ...s })),
  }

  const { data: template, error: tplErr } = await supabase
    .from("lxp_certificate_templates")
    .select("institution_name,institution_logo_path")
    .eq("id", templateId)
    .maybeSingle()

  if (tplErr) throw tplErr
  const tpl = template as TemplateMediaRow | null

  if (!enriched.institution_name?.trim() && tpl?.institution_name?.trim()) {
    enriched.institution_name = tpl.institution_name.trim()
  }

  if (!enriched.institution_logo_url?.trim() && tpl?.institution_logo_path?.trim()) {
    enriched.institution_logo_url = certificateSignaturePublicUrl(tpl.institution_logo_path)
  }

  const needsSigImages = enriched.signatures.some((s) => !s.image_url?.trim())
  if (needsSigImages) {
    const { data: slots, error: slotErr } = await supabase
      .from("lxp_certificate_template_signatures")
      .select(
        "slot,lxp_certificate_signatures(signer_name,signer_title,image_path)",
      )
      .eq("template_id", templateId)
      .order("slot", { ascending: true })

    if (slotErr) throw slotErr

    const bySlot = new Map(
      ((slots ?? []) as SlotMediaRow[])
        .filter((row) => row.lxp_certificate_signatures)
        .map((row) => [row.slot, row.lxp_certificate_signatures!]),
    )

    enriched.signatures = enriched.signatures.map((sig) => {
      if (sig.image_url?.trim()) return sig
      const slotRow = bySlot.get(sig.slot)
      if (!slotRow?.image_path?.trim()) return sig
      return {
        ...sig,
        image_url: certificateSignaturePublicUrl(slotRow.image_path),
      }
    })
  }

  return enriched
}
