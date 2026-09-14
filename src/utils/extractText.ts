export function extractText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('script, style, noscript').forEach(el => el.remove())
  return (doc.body?.textContent ?? '').replace(/\s+/g, ' ').trim()
}
