import DOMPurify from 'dompurify'
import { getMediaEmbed, standaloneUrlFromElement, type MediaEmbed } from './mediaEmbeds'

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

export type DescriptionBlock =
  | { type: 'html'; html: string }
  | { type: 'embed'; embed: MediaEmbed }

export function descriptionToContentBlocks(description: string): DescriptionBlock[] {
  const sanitized = descriptionToDisplayHtml(description)
  if (!sanitized) return []

  const doc = new DOMParser().parseFromString(sanitized, 'text/html')
  const blocks: DescriptionBlock[] = []
  let htmlBuf = ''

  const flush = () => {
    if (!htmlBuf) return
    blocks.push({ type: 'html', html: htmlBuf })
    htmlBuf = ''
  }

  for (const node of Array.from(doc.body.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      if (el.tagName === 'UL' || el.tagName === 'OL') {
        const items = Array.from(el.children).filter((child) => child.tagName === 'LI')
        const listEmbeds = items.map((item) => {
          const url = standaloneUrlFromElement(item)
          return url ? getMediaEmbed(url) : null
        })
        if (listEmbeds.length > 0 && listEmbeds.every((item) => item !== null)) {
          flush()
          for (const embed of listEmbeds) blocks.push({ type: 'embed', embed })
          continue
        }
      }

      const url = standaloneUrlFromElement(el)
      const embed = url ? getMediaEmbed(url) : null
      if (embed) {
        flush()
        blocks.push({ type: 'embed', embed })
        continue
      }
      htmlBuf += el.outerHTML
      continue
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? ''
      if (text.trim()) htmlBuf += escapeHtml(text)
    }
  }

  flush()
  return blocks
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
