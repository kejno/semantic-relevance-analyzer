import { describe, it, expect } from 'vitest'
import { segmentText } from '../../src/utils/segmentation.ts'

const LONG =
  'This is a paragraph with many enough words to clearly exceed the twenty word minimum threshold requirement for valid passage segmentation analysis.'
const LONG2 =
  'The second paragraph also contains many words to clearly exceed the twenty word minimum threshold requirement for valid passage segmentation analysis.'

describe('SCRUM-39: segmentText multi-paragraph splitting and short-passage discarding', () => {
  it('returns empty array for empty string input', () => {
    expect(segmentText('')).toEqual([])
  })

  it('returns empty array for whitespace-only input', () => {
    expect(segmentText('   \n\n   ')).toEqual([])
  })

  it('discards a single passage under 20 words', () => {
    expect(segmentText('Too short.')).toEqual([])
    expect(segmentText('Only a few words here.')).toEqual([])
  })

  it('keeps a single passage with 20 or more words', () => {
    const result = segmentText(LONG)
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(LONG)
  })

  it('splits two long paragraphs into two passages', () => {
    const result = segmentText(`${LONG}\n\n${LONG2}`)
    expect(result).toHaveLength(2)
    expect(result[0]).toBe(LONG)
    expect(result[1]).toBe(LONG2)
  })

  it('merges a short paragraph into the adjacent long paragraph', () => {
    const short = 'Short intro.'
    const result = segmentText(`${short}\n\n${LONG}`)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain(short)
    expect(result[0]).toContain(LONG)
  })

  it('merges a short trailing paragraph into the preceding long one', () => {
    const short = 'Conclusion.'
    const result = segmentText(`${LONG}\n\n${short}`)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain(LONG)
    expect(result[0]).toContain(short)
  })
})
