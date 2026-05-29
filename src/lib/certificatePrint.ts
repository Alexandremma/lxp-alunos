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
  /** URL base do site público de validação (default = origin). */
  validateBaseUrl?: string;
  /** Se true, dispara window.print() ao carregar (default). Use false em preview/iframe. */
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
  const signatureBlocks =
    sigs.length > 0
      ? sigs
          .map(
            (s) => `
        <div class="sig">
          ${s.imageUrl ? `<img src="${escapeHtml(s.imageUrl)}" alt="" class="sig-img" />` : '<div class="sig-line"></div>'}
          <p class="sig-name">${escapeHtml(s.signerName)}</p>
          <p class="sig-title">${escapeHtml(s.signerTitle)}</p>
        </div>`,
          )
          .join("")
      : `
        <div class="sig">
          <div class="sig-line"></div>
          <p class="sig-name">${escapeHtml(payload.instructorName?.trim() || "Equipe Acadêmica")}</p>
          <p class="sig-title">Instrutor(a)</p>
        </div>
        <div class="sig">
          <div class="sig-line"></div>
          <p class="sig-name">${escapeHtml(institution)}</p>
          <p class="sig-title">Instituição</p>
        </div>`;

  const autoPrintScript =
    payload.autoPrint === false
      ? ""
      : "<script>window.onload = function() { window.print(); };</script>";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Certificado — ${escapeHtml(payload.disciplineName)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Georgia, "Times New Roman", serif; margin: 0; padding: 32px; color: #111; background: #fff; }
    .frame { border: 3px double #4c1d95; padding: 48px 40px; max-width: 820px; margin: 0 auto; }
    .logo { text-align: center; margin: 0 0 16px; }
    .logo img { max-height: 64px; max-width: 220px; object-fit: contain; }
    .institution { text-align: center; font-size: 14px; letter-spacing: 0.08em; color: #4c1d95; text-transform: uppercase; margin: 0 0 24px; font-weight: 600; }
    h1 { font-size: 28px; text-align: center; margin: 0 0 8px; letter-spacing: 0.04em; }
    .subtitle { text-align: center; color: #555; margin: 8px 0 24px; }
    .student { font-size: 32px; text-align: center; color: #4c1d95; margin: 24px 0; font-weight: bold; }
    .discipline { font-size: 22px; text-align: center; margin: 8px 0 24px; }
    .meta { text-align: center; font-size: 14px; color: #444; margin: 4px 0; }
    .code { text-align: center; font-family: monospace; font-size: 13px; margin-top: 24px; padding: 12px; background: #f4f4f5; border-radius: 8px; }
    .sigs { display: flex; justify-content: space-around; gap: 24px; margin-top: 48px; flex-wrap: wrap; }
    .sig { flex: 1; min-width: 180px; text-align: center; }
    .sig-line { height: 48px; border-bottom: 2px solid #333; margin-bottom: 8px; }
    .sig-img { max-height: 56px; max-width: 160px; object-fit: contain; margin-bottom: 8px; }
    .sig-name { font-size: 14px; font-weight: 600; margin: 0; }
    .sig-title { font-size: 12px; color: #666; margin: 4px 0 0; }
    @media print { body { padding: 0; } .frame { border-width: 2px; } }
  </style>
</head>
<body>
  <div class="frame">
    ${logoBlock}
    <p class="institution">${escapeHtml(institution)}</p>
    <h1>Certificado de Conclusão</h1>
    <p class="subtitle">Certificamos que</p>
    <p class="student">${escapeHtml(payload.studentName)}</p>
    <p class="subtitle">concluiu com sucesso a disciplina</p>
    <p class="discipline">${escapeHtml(payload.disciplineName)}</p>
    ${workload}
    <p class="meta"><strong>Data de emissão:</strong> ${formatIssuedDate(payload.issuedAt)}</p>
    <p class="code"><strong>Código de validação:</strong> ${escapeHtml(payload.validationCode)}</p>
    <div class="sigs">${signatureBlocks}</div>
  </div>
  ${autoPrintScript}
</body>
</html>`;
}

export function openCertificatePrintWindow(payload: CertificatePrintPayload): void {
  const html = buildCertificatePrintHtml({
    ...payload,
    autoPrint: payload.autoPrint ?? true,
    validateBaseUrl: payload.validateBaseUrl ?? window.location.origin,
  });
  // Blob URL evita o bug de janela `about:blank` em Chromium/Edge quando se
  // usa `window.open("", ...)` + `document.write` (especialmente com
  // `noopener,noreferrer`). O HTML embute `window.print()` no onload.
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);
  const win = window.open(blobUrl, "_blank", "width=900,height=700");
  if (!win) {
    URL.revokeObjectURL(blobUrl);
    throw new Error("Não foi possível abrir a janela de impressão. Permita pop-ups para este site.");
  }
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}
