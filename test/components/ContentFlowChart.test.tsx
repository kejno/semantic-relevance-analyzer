import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/react'
import { ContentFlowChart } from '../../src/components/ContentFlowChart'

describe('ContentFlowChart', () => {
  afterEach(() => { cleanup() })

  it('renders nothing when passages array has fewer than 2 items', () => {
    const { container } = render(<ContentFlowChart passages={[{ text: 'a', score: 0.5 }]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when passages array is empty', () => {
    const { container } = render(<ContentFlowChart passages={[]} />)
    expect(container.firstChild).toBeNull()
  })

  describe('integration: 3 passages with varied scores', () => {
    const passages = [
      { text: 'High relevance passage about machine learning', score: 0.82 },
      { text: 'Medium relevance passage about data processing', score: 0.55 },
      { text: 'Low relevance passage about cooking recipes', score: 0.21 },
    ]

    it('renders 3 bars with correct colors matching threshold rules', () => {
      const { container } = render(<ContentFlowChart passages={passages} />)
      expect(container.querySelector('path[fill="#22c55e"]')).not.toBeNull()
      expect(container.querySelector('path[fill="#eab308"]')).not.toBeNull()
      expect(container.querySelector('path[fill="#ef4444"]')).not.toBeNull()
    })

    it('calls scrollIntoView on the corresponding PassageCard when a bar is clicked', () => {
      const scrollIntoViewMock = vi.fn()
      const targetEl = document.createElement('div')
      targetEl.setAttribute('data-passage-id', '0')
      targetEl.scrollIntoView = scrollIntoViewMock
      document.body.appendChild(targetEl)

      const { container } = render(<ContentFlowChart passages={passages} />)
      const greenBar = container.querySelector('path[fill="#22c55e"]')
      expect(greenBar).not.toBeNull()
      fireEvent.click(greenBar!)

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })
      document.body.removeChild(targetEl)
    })
  })
})
