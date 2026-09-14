import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { PassageList, HIGH_THRESHOLD, LOW_THRESHOLD } from '../../src/components/PassageList'

describe('PassageList', () => {
  afterEach(() => { cleanup() })

  describe('empty state', () => {
    it('shows empty state message when passages array is empty', () => {
      render(<PassageList passages={[]} />)
      expect(screen.getByText('Введите текст и целевой запрос для анализа')).toBeDefined()
    })

    it('does not show empty state message when passages are present', () => {
      render(<PassageList passages={[{ text: 'some text', score: 0.5 }]} />)
      expect(screen.queryByText('Введите текст и целевой запрос для анализа')).toBeNull()
    })
  })

  describe('integration: 3 passages with varied scores', () => {
    const passages = [
      { text: 'High relevance passage about machine learning models', score: 0.82 },
      { text: 'Medium relevance passage about data processing', score: 0.55 },
      { text: 'Low relevance passage about cooking recipes', score: 0.21 },
    ]

    it('renders all 3 passage texts', () => {
      render(<PassageList passages={passages} />)
      expect(screen.getByText(passages[0].text)).toBeDefined()
      expect(screen.getByText(passages[1].text)).toBeDefined()
      expect(screen.getByText(passages[2].text)).toBeDefined()
    })

    it('shows correct percentage values for all 3 passages', () => {
      render(<PassageList passages={passages} />)
      expect(screen.getByText('82%')).toBeDefined()
      expect(screen.getByText('55%')).toBeDefined()
      expect(screen.getByText('21%')).toBeDefined()
    })

    it('assigns green color badge for high-score passage (score 0.82)', () => {
      render(<PassageList passages={passages} />)
      const card = document.querySelector('[data-passage-id="0"]')!
      expect(card.querySelector('[data-color="green"]')).not.toBeNull()
    })

    it('assigns yellow color badge for medium-score passage (score 0.55)', () => {
      render(<PassageList passages={passages} />)
      const card = document.querySelector('[data-passage-id="1"]')!
      expect(card.querySelector('[data-color="yellow"]')).not.toBeNull()
    })

    it('assigns red color badge for low-score passage (score 0.21)', () => {
      render(<PassageList passages={passages} />)
      const card = document.querySelector('[data-passage-id="2"]')!
      expect(card.querySelector('[data-color="red"]')).not.toBeNull()
    })
  })

  describe('data-passage-id attributes', () => {
    it('each card has data-passage-id equal to its index', () => {
      const passages = [
        { text: 'First passage content', score: 0.9 },
        { text: 'Second passage content', score: 0.5 },
      ]
      render(<PassageList passages={passages} />)
      expect(document.querySelector('[data-passage-id="0"]')).not.toBeNull()
      expect(document.querySelector('[data-passage-id="1"]')).not.toBeNull()
    })
  })

  describe('color threshold boundary conditions', () => {
    it('score exactly at HIGH_THRESHOLD gets green badge', () => {
      render(<PassageList passages={[{ text: 'exact high threshold', score: HIGH_THRESHOLD }]} />)
      expect(document.querySelector('[data-color="green"]')).not.toBeNull()
    })

    it('score just below HIGH_THRESHOLD gets yellow badge', () => {
      render(<PassageList passages={[{ text: 'just below high', score: HIGH_THRESHOLD - 0.01 }]} />)
      expect(document.querySelector('[data-color="yellow"]')).not.toBeNull()
    })

    it('score exactly at LOW_THRESHOLD gets yellow badge', () => {
      render(<PassageList passages={[{ text: 'exact low threshold', score: LOW_THRESHOLD }]} />)
      expect(document.querySelector('[data-color="yellow"]')).not.toBeNull()
    })

    it('score just below LOW_THRESHOLD gets red badge', () => {
      render(<PassageList passages={[{ text: 'just below low', score: LOW_THRESHOLD - 0.01 }]} />)
      expect(document.querySelector('[data-color="red"]')).not.toBeNull()
    })
  })

  describe('passage ordering', () => {
    it('preserves input array order, not sorted by score', () => {
      const passages = [
        { text: 'Low score but first in array', score: 0.2 },
        { text: 'High score but second in array', score: 0.9 },
        { text: 'Medium score but third in array', score: 0.5 },
      ]
      render(<PassageList passages={passages} />)
      const cards = document.querySelectorAll('[data-passage-id]')
      expect(cards[0].textContent).toContain('Low score but first in array')
      expect(cards[1].textContent).toContain('High score but second in array')
      expect(cards[2].textContent).toContain('Medium score but third in array')
    })
  })
})
