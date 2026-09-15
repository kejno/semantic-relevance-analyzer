import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { ContentFlowChart } from '../../src/components/ContentFlowChart'

describe('SRA-34: ContentFlowChart axis labels — Y-axis reads "Релевантность" and X-axis ticks read "Пассаж N"', () => {
  afterEach(() => { cleanup() })

  const passages = [
    { text: 'Passage one', score: 0.82 },
    { text: 'Passage two', score: 0.55 },
    { text: 'Passage three', score: 0.21 },
  ]

  it('renders Y-axis label with text "Релевантность"', () => {
    const { container } = render(<ContentFlowChart passages={passages} />)
    const textNodes = Array.from(container.querySelectorAll('text'))
    const yLabel = textNodes.find(el => el.textContent === 'Релевантность')
    expect(yLabel).not.toBeUndefined()
  })

  it('renders X-axis tick "Пассаж 1" for the first passage', () => {
    const { container } = render(<ContentFlowChart passages={passages} />)
    const textNodes = Array.from(container.querySelectorAll('text'))
    const tick = textNodes.find(el => el.textContent === 'Пассаж 1')
    expect(tick).not.toBeUndefined()
  })

  it('renders X-axis tick "Пассаж 2" for the second passage', () => {
    const { container } = render(<ContentFlowChart passages={passages} />)
    const textNodes = Array.from(container.querySelectorAll('text'))
    const tick = textNodes.find(el => el.textContent === 'Пассаж 2')
    expect(tick).not.toBeUndefined()
  })

  it('renders X-axis tick "Пассаж 3" for the third passage', () => {
    const { container } = render(<ContentFlowChart passages={passages} />)
    const textNodes = Array.from(container.querySelectorAll('text'))
    const tick = textNodes.find(el => el.textContent === 'Пассаж 3')
    expect(tick).not.toBeUndefined()
  })

  it('renders X-axis label with text "Пассаж"', () => {
    const { container } = render(<ContentFlowChart passages={passages} />)
    const textNodes = Array.from(container.querySelectorAll('text'))
    const xLabel = textNodes.find(el => el.textContent === 'Пассаж')
    expect(xLabel).not.toBeUndefined()
  })
})
