import { describe, it, expect } from 'vitest'
import { cosineSimilarity } from '../../src/utils/similarity.ts'

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1)
  })

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0)
  })

  it('returns 0 for a zero vector', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 0, 0])).toBe(0)
  })

  it('returns 0 for two zero vectors', () => {
    expect(cosineSimilarity([0, 0, 0], [0, 0, 0])).toBe(0)
  })

  it('returns value between 0 and 1 for similar vectors', () => {
    const result = cosineSimilarity([1, 2, 3], [1, 2, 4])
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(1)
  })

  it('returns 1 for parallel scaled vectors', () => {
    expect(cosineSimilarity([1, 2, 3], [2, 4, 6])).toBeCloseTo(1)
  })

  it('handles multi-dimensional vectors correctly', () => {
    const a = [0.5, 0.5, 0, 0]
    const b = [0, 0, 0.5, 0.5]
    expect(cosineSimilarity(a, b)).toBeCloseTo(0)
  })
})
