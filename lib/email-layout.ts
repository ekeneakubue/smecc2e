export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function emailLayout(options: {
  title: string;
  preheader?: string;
  bodyHtml: string;
}): string {
  const { title, preheader, bodyHtml } = options;
  const preheaderHtml = preheader
    ? `<span style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(preheader)}</span>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#1e293b;">
  ${preheaderHtml}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f4f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="background:#062763;padding:20px 28px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.02em;">SMECC2E</p>
              <p style="margin:6px 0 0;font-size:12px;color:#cbd5e1;">Scholarship application portal</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;">
              <p style="margin:0;font-size:11px;color:#64748b;line-height:1.5;">
                This message was sent by the SMECC2E application system. If you did not request it, you can ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `<p style="margin:24px 0;">
  <a href="${safeHref}" style="display:inline-block;padding:12px 22px;background:#062763;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${safeLabel}</a>
</p>`;
}

export function emailDetailsTable(
  rows: { label: string; value: string }[]
): string {
  const cells = rows
    .filter((r) => r.value.trim())
    .map(
      (r) => `<tr>
        <td style="padding:8px 12px 8px 0;font-size:13px;font-weight:600;color:#475569;vertical-align:top;width:42%;">${escapeHtml(r.label)}</td>
        <td style="padding:8px 0;font-size:13px;color:#0f172a;vertical-align:top;">${escapeHtml(r.value)}</td>
      </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0 0;border-collapse:collapse;">
    ${cells}
  </table>`;
}
