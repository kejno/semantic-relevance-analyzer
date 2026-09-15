const BLOCK_TAGS = 'p, div, br, h1, h2, h3, h4, h5, h6, li, tr, blockquote, section, article'
const BLOCK_BREAK = '\0'
const HAS_HTML_TAG = /<[a-z][\s\S]*>/i

function normalizePlainText(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map(chunk => chunk.replace(/[ \t]+/g, ' ').trim())
    .filter(chunk => chunk.length > 0)
    .join('\n\n')
}

export function extractText(html: string): string {
  if (!HAS_HTML_TAG.test(html)) return normalizePlainText(html)

  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('script, style, noscript').forEach(el => el.remove())
  doc.querySelectorAll(BLOCK_TAGS).forEach(el => el.append(doc.createTextNode(BLOCK_BREAK)))
  const raw = doc.body?.textContent ?? ''
  return raw
    .split(BLOCK_BREAK)
    .map(chunk => chunk.replace(/\s+/g, ' ').trim())
    .filter(chunk => chunk.length > 0)
    .join('\n\n')
}
