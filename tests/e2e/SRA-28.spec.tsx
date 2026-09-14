import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { PassageList } from '../../src/components/PassageList'

describe('SRA-28: PassageList preserves original text order — cards not sorted by score', () => {
  afterEach(() => { cleanup() })

  it('renders cards in input array order, not sorted by score', () => {
    const passages = [
      { text: 'First: low score passage', score: 0.2 },
      { text: 'Second: high score passage', score: 0.9 },
      { text: 'Third: medium score passage', score: 0.5 },
    ]
    render(<PassageList passages={passages} />)
    const cards = document.querySelectorAll('[data-passage-id]')
    expect(cards.length).toBe(3)
    expect(cards[0].textContent).toContain('First: low score passage')
    expect(cards[1].textContent).toContain('Second: high score passage')
    expect(cards[2].textContent).toContain('Third: medium score passage')
  })

  it('data-passage-id attributes reflect input array indices', () => {
    const passages = [
      { text: 'Passage alpha', score: 0.1 },
      { text: 'Passage beta', score: 0.8 },
    ]
    render(<PassageList passages={passages} />)
    expect(document.querySelector('[data-passage-id="0"]')).not.toBeNull()
    expect(document.querySelector('[data-passage-id="1"]')).not.toBeNull()
    expect(document.querySelector('[data-passage-id="0"]')!.textContent).toContain('Passage alpha')
    expect(document.querySelector('[data-passage-id="1"]')!.textContent).toContain('Passage beta')
  })
})
