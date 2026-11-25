/** Strip control characters (keep newline and tab) and angle brackets, then trim. */
export function sanitizeText(v: unknown): string {
  if (typeof v !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/[<>]/g, "").trim();
}

export function digitsOnly(v: string): string {
  return v.replace(/\D/g, "");
}

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(v: string): string {
  return v.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c);
}
