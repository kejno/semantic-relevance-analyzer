import { describe, it, expect } from 'vitest'
import { segmentText } from '../../src/utils/segmentation.ts'

const LONG = 'This is a paragraph with many enough words to clearly exceed the twenty word minimum threshold requirement for valid passage segmentation analysis.'
const LONG2 = 'The second paragraph also contains many words to clearly exceed the twenty word minimum threshold requirement for valid passage segmentation analysis.'

describe('segmentText', () => {
  it('returns empty array for empty string', () => {
    expect(segmentText('')).toEqual([])
  })

  it('returns empty array for whitespace-only string', () => {
    expect(segmentText('   \n\n   ')).toEqual([])
  })

  it('discards a single paragraph shorter than 20 words', () => {
    expect(segmentText('Too short paragraph.')).toEqual([])
  })

  it('keeps a single paragraph with 20 or more words', () => {
    expect(segmentText(LONG)).toEqual([LONG])
  })

  it('splits two long paragraphs into two passages', () => {
    const result = segmentText(`${LONG}\n\n${LONG2}`)
    expect(result).toHaveLength(2)
    expect(result[0]).toBe(LONG)
    expect(result[1]).toBe(LONG2)
  })

  it('merges a short leading paragraph into the following long one', () => {
    const short = 'Introduction.'
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

  it('merges multiple short paragraphs together with the next long one', () => {
    const s1 = 'First short bit.'
    const s2 = 'Second short bit.'
    const result = segmentText(`${s1}\n\n${s2}\n\n${LONG}`)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain(s1)
    expect(result[0]).toContain(s2)
    expect(result[0]).toContain(LONG)
  })

  it('handles multiple long paragraphs each with their own short neighbours', () => {
    const short1 = 'Intro note.'
    const short2 = 'Transition.'
    const result = segmentText(`${short1}\n\n${LONG}\n\n${short2}\n\n${LONG2}`)
    expect(result).toHaveLength(2)
    expect(result[0]).toContain(short1)
    expect(result[0]).toContain(LONG)
    expect(result[1]).toContain(short2)
    expect(result[1]).toContain(LONG2)
  })
})
