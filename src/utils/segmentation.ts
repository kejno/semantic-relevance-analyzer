const MIN_WORDS = 20

function wordCount(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length
}

export function segmentText(text: string): string[] {
  if (!text.trim()) return []

  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0)

  const result: string[] = []
  let buffer = ''

  for (const para of paragraphs) {
    if (wordCount(para) < MIN_WORDS) {
      buffer = buffer ? `${buffer} ${para}` : para
    } else {
      result.push(buffer ? `${buffer} ${para}` : para)
      buffer = ''
    }
  }

  if (buffer && result.length > 0) {
    result[result.length - 1] = `${result[result.length - 1]} ${buffer}`
  }

  return result
}
