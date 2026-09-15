import { describe, it } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { ContentFlowChart } from '../../src/components/ContentFlowChart'

describe('debug', () => {
  it('shows html', () => {
    const passages = [
      { text: 'a', score: 0.82 },
      { text: 'b', score: 0.55 },
      { text: 'c', score: 0.21 },
    ]
    const { container } = render(<ContentFlowChart passages={passages} />)
    // Find all rect elements
    const rects = container.querySelectorAll('rect')
    console.log('Rect count:', rects.length)
    rects.forEach((r, i) => {
      console.log(`rect[${i}] fill=${r.getAttribute('fill')} style=${r.getAttribute('style')} class=${r.getAttribute('class')}`)
    })
    console.log('All bar-rects classes:')
    container.querySelectorAll('[class*="recharts-bar"]').forEach((el, i) => {
      console.log(`[${i}]`, el.tagName, el.getAttribute('class'), el.innerHTML.substring(0, 200))
    })
    cleanup()
  })
})
