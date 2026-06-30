import DOMPurify from "dompurify";

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li", "blockquote", "code"],
    ALLOWED_ATTR: ["href", "title", "rel", "target"],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
  });
}

export function stripHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };
  let out = "";
  for (const ch of str) out += map[ch] ?? ch;
  return out;
}

export function escapeUrl(str: string): string {
  return encodeURIComponent(str);
}
