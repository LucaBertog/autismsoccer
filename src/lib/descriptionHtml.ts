import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'blockquote',
  'a',
  'img',
]

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'target', 'rel']

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function isLikelyHtml(text: string): boolean {
  return /<(?:p|br|strong|em|ul|ol|li|h[1-6]|img|a|blockquote|div)\b/i.test(text)
}

export function plainTextToHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .map((paragraph) => {
      const escaped = escapeHtml(paragraph)
      return `<p>${escaped.replace(/\n/g, '<br>')}</p>`
    })
    .join('')
}

export function descriptionToEditorHtml(description: string): string {
  const trimmed = description.trim()
  if (!trimmed) return ''
  return isLikelyHtml(trimmed) ? trimmed : plainTextToHtml(trimmed)
}

export function sanitizeDescriptionHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  })
}

export function descriptionToDisplayHtml(description: string): string {
  const trimmed = description.trim()
  if (!trimmed) return ''
  const html = isLikelyHtml(trimmed) ? trimmed : plainTextToHtml(trimmed)
  return sanitizeDescriptionHtml(html)
}

export function isDescriptionEmpty(html: string): boolean {
  const text = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }).trim()
  return text.length === 0 && !/<img\b/i.test(html)
}

export function normalizeDescriptionForSave(html: string): string {
  const sanitized = sanitizeDescriptionHtml(html)
  if (isDescriptionEmpty(sanitized)) return ''
  return sanitized
}
