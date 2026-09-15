import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { PassageList } from '../../src/components/PassageList'

describe('SRA-30: PassageList renders passages — correct color badges, percentage scores, and data-passage-id attributes', () => {
  afterEach(() => { cleanup() })

  const passages = [
    { text: 'High relevance passage about machine learning models', score: 0.82 },
    { text: 'Medium relevance passage about data processing', score: 0.55 },
    { text: 'Low relevance passage about unrelated topics', score: 0.21 },
  ]

  it('renders 3 PassageCard elements for 3 passages', () => {
    render(<PassageList passages={passages} />)
    expect(document.querySelectorAll('[data-passage-id]').length).toBe(3)
  })

  it('shows correct percentage-formatted scores', () => {
    render(<PassageList passages={passages} />)
    expect(screen.getByText('82%')).toBeDefined()
    expect(screen.getByText('55%')).toBeDefined()
    expect(screen.getByText('21%')).toBeDefined()
  })

  it('assigns green badge to high-score passage (score 0.82 >= 0.7)', () => {
    render(<PassageList passages={passages} />)
    const card = document.querySelector('[data-passage-id="0"]')!
    expect(card.querySelector('[data-color="green"]')).not.toBeNull()
  })

  it('assigns yellow badge to medium-score passage (0.4 <= score 0.55 < 0.7)', () => {
    render(<PassageList passages={passages} />)
    const card = document.querySelector('[data-passage-id="1"]')!
    expect(card.querySelector('[data-color="yellow"]')).not.toBeNull()
  })

  it('assigns red badge to low-score passage (score 0.21 < 0.4)', () => {
    render(<PassageList passages={passages} />)
    const card = document.querySelector('[data-passage-id="2"]')!
    expect(card.querySelector('[data-color="red"]')).not.toBeNull()
  })

  it('assigns correct data-passage-id attributes to each card', () => {
    render(<PassageList passages={passages} />)
    expect(document.querySelector('[data-passage-id="0"]')).not.toBeNull()
    expect(document.querySelector('[data-passage-id="1"]')).not.toBeNull()
    expect(document.querySelector('[data-passage-id="2"]')).not.toBeNull()
  })
})
