import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { ContentFlowChart } from '../../src/components/ContentFlowChart'

describe('SRA-33: ContentFlowChart visibility gate — hidden with 0 or 1 passage, visible with 2 or more', () => {
  afterEach(() => { cleanup() })

  it('renders nothing when passages array is empty', () => {
    const { container } = render(<ContentFlowChart passages={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when passages array has exactly 1 item', () => {
    const { container } = render(<ContentFlowChart passages={[{ text: 'Solo passage', score: 0.5 }]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the chart when passages array has exactly 2 items', () => {
    const { container } = render(<ContentFlowChart passages={[
      { text: 'First passage', score: 0.8 },
      { text: 'Second passage', score: 0.3 },
    ]} />)
    expect(container.firstChild).not.toBeNull()
  })

  it('renders the chart when passages array has 3 items', () => {
    const { container } = render(<ContentFlowChart passages={[
      { text: 'First passage', score: 0.8 },
      { text: 'Second passage', score: 0.5 },
      { text: 'Third passage', score: 0.2 },
    ]} />)
    expect(container.firstChild).not.toBeNull()
  })

  it('renders an svg element (chart) when passages array has 2 or more items', () => {
    const { container } = render(<ContentFlowChart passages={[
      { text: 'First passage', score: 0.8 },
      { text: 'Second passage', score: 0.3 },
    ]} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })
})
