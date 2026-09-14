import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { PassageList } from '../../src/components/PassageList'

describe('SRA-29: PassageList with empty array — placeholder message displayed', () => {
  afterEach(() => { cleanup() })

  it('shows placeholder message when passages array is empty', () => {
    render(<PassageList passages={[]} />)
    expect(screen.getByText('Введите текст и целевой запрос для анализа')).toBeDefined()
  })

  it('renders no PassageCard elements when passages array is empty', () => {
    render(<PassageList passages={[]} />)
    expect(document.querySelectorAll('[data-passage-id]').length).toBe(0)
  })
})
