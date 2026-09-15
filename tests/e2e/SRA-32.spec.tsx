import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/react'
import { ContentFlowChart } from '../../src/components/ContentFlowChart'

describe('SRA-32: ContentFlowChart bar click — scrollIntoView called on matching PassageCard', () => {
  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  const passages = [
    { text: 'High relevance passage', score: 0.82 },
    { text: 'Medium relevance passage', score: 0.55 },
    { text: 'Low relevance passage', score: 0.21 },
  ]

  it('calls scrollIntoView on element with data-passage-id="0" when first bar is clicked', () => {
    const scrollMock = vi.fn()
    const target = document.createElement('div')
    target.setAttribute('data-passage-id', '0')
    target.scrollIntoView = scrollMock
    document.body.appendChild(target)

    const { container } = render(<ContentFlowChart passages={passages} />)
    const greenBar = container.querySelector('path[fill="#22c55e"]')
    expect(greenBar).not.toBeNull()
    fireEvent.click(greenBar!)

    expect(scrollMock).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('calls scrollIntoView with smooth behavior option', () => {
    const scrollMock = vi.fn()
    const target = document.createElement('div')
    target.setAttribute('data-passage-id', '0')
    target.scrollIntoView = scrollMock
    document.body.appendChild(target)

    const { container } = render(<ContentFlowChart passages={passages} />)
    const greenBar = container.querySelector('path[fill="#22c55e"]')
    fireEvent.click(greenBar!)

    expect(scrollMock).toHaveBeenCalledTimes(1)
    expect(scrollMock).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('does not throw when target PassageCard element does not exist in DOM', () => {
    const { container } = render(<ContentFlowChart passages={passages} />)
    const greenBar = container.querySelector('path[fill="#22c55e"]')
    expect(greenBar).not.toBeNull()
    expect(() => fireEvent.click(greenBar!)).not.toThrow()
  })
})
