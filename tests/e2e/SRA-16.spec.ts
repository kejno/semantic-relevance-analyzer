import { describe, it, expect } from 'vitest'
import { cosineSimilarity } from '../../src/utils/similarity.ts'

describe('SRA-16: cosineSimilarity boundary values', () => {
  it('returns 1.0 for identical vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1.0)
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1.0)
  })

  it('returns 0.0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0.0)
    expect(cosineSimilarity([1, 0, 0], [0, 0, 1])).toBeCloseTo(0.0)
    expect(cosineSimilarity([0, 1, 0], [0, 0, 1])).toBeCloseTo(0.0)
  })

  it('returns value in (0, 1) for partially similar vectors', () => {
    const result = cosineSimilarity([1, 2, 3], [1, 2, 4])
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(1)
  })

  it('returns 0 when either vector is a zero vector', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 0, 0])).toBe(0)
    expect(cosineSimilarity([1, 0, 0], [0, 0, 0])).toBe(0)
    expect(cosineSimilarity([0, 0, 0], [0, 0, 0])).toBe(0)
  })
})
