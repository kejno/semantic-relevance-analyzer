import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { PassageList, HIGH_THRESHOLD, LOW_THRESHOLD } from '../../src/components/PassageList'

describe('SRA-31: PassageCard badge color at threshold boundaries — score 0.7, 0.4, and 0.39', () => {
  afterEach(() => { cleanup() })

  it('score exactly at HIGH_THRESHOLD (0.7) gets green badge', () => {
    render(<PassageList passages={[{ text: 'boundary high threshold', score: 0.7 }]} />)
    expect(document.querySelector('[data-color="green"]')).not.toBeNull()
    expect(screen.getByText('70%')).toBeDefined()
  })

  it('score exactly at LOW_THRESHOLD (0.4) gets yellow badge', () => {
    render(<PassageList passages={[{ text: 'boundary low threshold', score: 0.4 }]} />)
    expect(document.querySelector('[data-color="yellow"]')).not.toBeNull()
    expect(screen.getByText('40%')).toBeDefined()
  })

  it('score 0.39 (just below LOW_THRESHOLD) gets red badge', () => {
    render(<PassageList passages={[{ text: 'just below low threshold', score: 0.39 }]} />)
    expect(document.querySelector('[data-color="red"]')).not.toBeNull()
    expect(screen.getByText('39%')).toBeDefined()
  })

  it('score just below HIGH_THRESHOLD (0.69) gets yellow badge', () => {
    render(<PassageList passages={[{ text: 'just below high threshold', score: 0.69 }]} />)
    expect(document.querySelector('[data-color="yellow"]')).not.toBeNull()
  })

  it('exports HIGH_THRESHOLD as 0.7 and LOW_THRESHOLD as 0.4', () => {
    expect(HIGH_THRESHOLD).toBe(0.7)
    expect(LOW_THRESHOLD).toBe(0.4)
  })
})
