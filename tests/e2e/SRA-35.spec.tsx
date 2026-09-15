import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { ContentFlowChart } from '../../src/components/ContentFlowChart'

describe('SRA-35: ContentFlowChart renders bars with correct color coding — green/yellow/red by score threshold', () => {
  afterEach(() => { cleanup() })

  const passages = [
    { text: 'High relevance passage about machine learning', score: 0.82 },
    { text: 'Medium relevance passage about data processing', score: 0.55 },
    { text: 'Low relevance passage about cooking recipes', score: 0.21 },
  ]

  it('renders a green bar for passage with score >= 0.7', () => {
    const { container } = render(<ContentFlowChart passages={passages} />)
    expect(container.querySelector('path[fill="#22c55e"]')).not.toBeNull()
  })

  it('renders a yellow bar for passage with score in range [0.4, 0.7)', () => {
    const { container } = render(<ContentFlowChart passages={passages} />)
    expect(container.querySelector('path[fill="#eab308"]')).not.toBeNull()
  })

  it('renders a red bar for passage with score < 0.4', () => {
    const { container } = render(<ContentFlowChart passages={passages} />)
    expect(container.querySelector('path[fill="#ef4444"]')).not.toBeNull()
  })

  it('renders all three color-coded bars simultaneously for three passages', () => {
    const { container } = render(<ContentFlowChart passages={passages} />)
    expect(container.querySelector('path[fill="#22c55e"]')).not.toBeNull()
    expect(container.querySelector('path[fill="#eab308"]')).not.toBeNull()
    expect(container.querySelector('path[fill="#ef4444"]')).not.toBeNull()
  })

  it('score exactly at HIGH_THRESHOLD (0.7) gets green bar', () => {
    const { container } = render(<ContentFlowChart passages={[
      { text: 'Boundary high', score: 0.7 },
      { text: 'Below', score: 0.2 },
    ]} />)
    expect(container.querySelector('path[fill="#22c55e"]')).not.toBeNull()
  })

  it('score exactly at LOW_THRESHOLD (0.4) gets yellow bar', () => {
    const { container } = render(<ContentFlowChart passages={[
      { text: 'Boundary low', score: 0.4 },
      { text: 'High', score: 0.9 },
    ]} />)
    expect(container.querySelector('path[fill="#eab308"]')).not.toBeNull()
  })

  it('score just below LOW_THRESHOLD (0.39) gets red bar', () => {
    const { container } = render(<ContentFlowChart passages={[
      { text: 'Just below low', score: 0.39 },
      { text: 'High', score: 0.9 },
    ]} />)
    expect(container.querySelector('path[fill="#ef4444"]')).not.toBeNull()
  })
})
