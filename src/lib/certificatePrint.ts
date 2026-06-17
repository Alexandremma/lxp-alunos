import { embedCertificatePrintImages } from "@/lib/certificateImageEmbed"

export type CertificatePrintSignature = {
  signerName: string;
  signerTitle: string;
  imageUrl?: string | null;
};

export type CertificatePrintPayload = {
  studentName: string;
  disciplineName: string;
  issuedAt: string;
  validationCode: string;
  workloadHours?: number | null;
  instructorName?: string | null;
  institutionName?: string;
  institutionLogoUrl?: string | null;
  signatures?: CertificatePrintSignature[];
  /** URL absoluta de validação pública (portal aluno) */
  validationUrl?: string;
  qrCodeDataUrl?: string;
  /** @deprecated use validationUrl — mantido por compatibilidade */
  validateBaseUrl?: string;
  autoPrint?: boolean;
};

function formatIssuedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildVerifyBlock(payload: CertificatePrintPayload): string {
  if (!payload.qrCodeDataUrl) return "";
  // data URL gerada localmente — não passar por escapeHtml (base64 é seguro em aspas duplas)
  return `
    <div class="verify-block">
      <img src="${payload.qrCodeDataUrl}" alt="Validação" class="verify-qr" />
      <p class="verify-code">${escapeHtml(payload.validationCode)}</p>
    </div>`;
}

export function buildCertificatePrintHtml(payload: CertificatePrintPayload): string {
  const institution = payload.institutionName?.trim() || "B42 Edtech";
  const logoBlock = payload.institutionLogoUrl?.trim()
    ? `<div class="logo"><img src="${escapeHtml(payload.institutionLogoUrl)}" alt="${escapeHtml(institution)}" /></div>`
    : "";
  const workload =
    payload.workloadHours != null && payload.workloadHours > 0
      ? `<p class="meta"><strong>Carga horária:</strong> ${payload.workloadHours} horas</p>`
      : "";

  const sigs = payload.signatures ?? [];
  const signatureBlocks = sigs
    .map(
      (s) => `
        <div class="sig">
          ${s.imageUrl ? `<img src="${escapeHtml(s.imageUrl)}" alt="" class="sig-img" />` : '<div class="sig-line"></div>'}
          <p class="sig-name">${escapeHtml(s.signerName)}</p>
          <p class="sig-title">${escapeHtml(s.signerTitle)}</p>
        </div>`,
    )
    .join("");

  const sigsBlock =
    sigs.length > 0 ? `<div class="sigs">${signatureBlocks}</div>` : "";

  const footerRow = sigsBlock ? `<div class="footer-row">${sigsBlock}</div>` : "";
  const verifyBlock = buildVerifyBlock(payload);

  const printScript =
    payload.autoPrint === false
      ? ""
      : `<script>
function waitForImages(done) {
  var imgs = Array.prototype.slice.call(document.images || []);
  if (!imgs.length) { done(); return; }
  var pending = imgs.length;
  function tick() { if (--pending <= 0) done(); }
  imgs.forEach(function(img) {
    if (img.complete) tick();
    else { img.onload = tick; img.onerror = tick; }
  });
}
window.onload = function() {
  waitForImages(function() { window.print(); });
};
</script>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Certificado — ${escapeHtml(payload.disciplineName)}</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    * { box-sizing: border-box; }
    body { font-family: Georgia, "Times New Roman", serif; margin: 0; padding: 18px 22px; color: #111; background: #fff; }
    .frame { position: relative; border: 3px double #4c1d95; padding: 24px 40px 32px; width: 100%; margin: 0 auto; page-break-inside: avoid; }
    .main { text-align: center; }
    .logo { text-align: center; margin: 0 0 8px; }
    .logo img { max-height: 48px; max-width: 180px; object-fit: contain; }
    .institution { text-align: center; font-size: 12px; letter-spacing: 0.08em; color: #4c1d95; text-transform: uppercase; margin: 0 0 10px; font-weight: 600; }
    h1 { font-size: 24px; text-align: center; margin: 0 0 4px; letter-spacing: 0.04em; }
    .subtitle { text-align: center; color: #555; margin: 4px 0 8px; font-size: 14px; }
    .student { font-size: 28px; text-align: center; color: #4c1d95; margin: 8px 0; font-weight: bold; }
    .discipline { font-size: 18px; text-align: center; margin: 4px 0 10px; }
    .meta { text-align: center; font-size: 12px; color: #444; margin: 2px 0; }
    .footer-row { margin-top: 16px; }
    .sigs { display: flex; flex-direction: row; flex-wrap: nowrap; justify-content: center; align-items: flex-end; gap: 48px; }
    .sig { flex: 0 0 auto; width: 150px; text-align: center; }
    .sig-line { height: 36px; border-bottom: 2px solid #333; margin-bottom: 6px; }
    .sig-img { max-height: 44px; max-width: 140px; object-fit: contain; margin-bottom: 6px; }
    .sig-name { font-size: 12px; font-weight: 600; margin: 0; }
    .sig-title { font-size: 10px; color: #666; margin: 2px 0 0; }
    .verify-block { position: absolute; right: 14px; bottom: 10px; text-align: center; }
    .verify-qr { width: 58px; height: 58px; display: block; margin: 0 auto 3px; image-rendering: pixelated; image-rendering: crisp-edges; }
    .verify-code { font-family: monospace; font-size: 8px; color: #555; margin: 0; line-height: 1.2; word-break: break-all; max-width: 88px; }
    @media print { body { padding: 0; } .frame { border-width: 2px; padding: 20px 32px 28px; } .verify-qr { width: 15mm; height: 15mm; } }
  </style>
</head>
<body>
  <div class="frame">
    <div class="main">
      ${logoBlock}
      <p class="institution">${escapeHtml(institution)}</p>
      <h1>Certificado de Conclusão</h1>
      <p class="subtitle">Certificamos que</p>
      <p class="student">${escapeHtml(payload.studentName)}</p>
      <p class="subtitle">concluiu com sucesso a disciplina</p>
      <p class="discipline">${escapeHtml(payload.disciplineName)}</p>
      ${workload}
      <p class="meta"><strong>Data de emissão:</strong> ${formatIssuedDate(payload.issuedAt)}</p>
    </div>
    ${footerRow}
    ${verifyBlock}
  </div>
  ${printScript}
</body>
</html>`;
}

export async function openCertificatePrintWindow(payload: CertificatePrintPayload): Promise<void> {
  const embedded = await embedCertificatePrintImages(payload);
  const html = buildCertificatePrintHtml({
    ...embedded,
    autoPrint: payload.autoPrint ?? true,
  });
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);
  const win = window.open(blobUrl, "_blank", "width=1100,height=780");
  if (!win) {
    URL.revokeObjectURL(blobUrl);
    throw new Error("Não foi possível abrir a janela de impressão. Permita pop-ups para este site.");
  }
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

export function certificateDetailToPrintPayload(detail: {
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  codeHash: string;
  workloadHours: number | null;
  instructor: string;
  institutionName: string;
  institutionLogoUrl: string | null;
  signatures: CertificatePrintSignature[];
  validationUrl: string;
}): CertificatePrintPayload {
  return {
    studentName: detail.studentName,
    disciplineName: detail.courseTitle,
    issuedAt: detail.issuedAt,
    validationCode: detail.codeHash,
    workloadHours: detail.workloadHours,
    institutionName: detail.institutionName,
    institutionLogoUrl: detail.institutionLogoUrl,
    signatures: detail.signatures,
    validationUrl: detail.validationUrl,
  };
}
