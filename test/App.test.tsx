import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App.tsx'

describe('App', () => {
  // RTL auto-cleanup requires afterEach in global scope; vitest.config.ts has globals:false so we call it explicitly
  afterEach(() => { cleanup() })

  it('mounts without errors', () => {
    render(<App />)
    expect(screen.getByText('Semantic Relevance Analyzer')).toBeDefined()
  })

  it('renders both tab buttons', () => {
    render(<App />)
    expect(screen.getByRole('tab', { name: 'Текстовый режим' })).toBeDefined()
    expect(screen.getByRole('tab', { name: 'URL-режим' })).toBeDefined()
  })

  it('text mode tab is active by default', () => {
    render(<App />)
    const textTab = screen.getByRole('tab', { name: 'Текстовый режим' })
    expect(textTab.getAttribute('aria-selected')).toBe('true')
    const urlTab = screen.getByRole('tab', { name: 'URL-режим' })
    expect(urlTab.getAttribute('aria-selected')).toBe('false')
  })

  it('clicking URL tab makes it active and deactivates text tab', async () => {
    const user = userEvent.setup()
    render(<App />)

    const urlTab = screen.getByRole('tab', { name: 'URL-режим' })
    await user.click(urlTab)

    expect(urlTab.getAttribute('aria-selected')).toBe('true')
    const textTab = screen.getByRole('tab', { name: 'Текстовый режим' })
    expect(textTab.getAttribute('aria-selected')).toBe('false')
  })

  it('clicking URL tab then text tab restores text tab as active', async () => {
    const user = userEvent.setup()
    render(<App />)

    const urlTab = screen.getByRole('tab', { name: 'URL-режим' })
    const textTab = screen.getByRole('tab', { name: 'Текстовый режим' })

    await user.click(urlTab)
    await user.click(textTab)

    expect(textTab.getAttribute('aria-selected')).toBe('true')
    expect(urlTab.getAttribute('aria-selected')).toBe('false')
  })

  it('tab buttons have aria-controls linking to the tabpanel', () => {
    render(<App />)
    const textTab = screen.getByRole('tab', { name: 'Текстовый режим' })
    const urlTab = screen.getByRole('tab', { name: 'URL-режим' })
    expect(textTab.getAttribute('aria-controls')).toBe('panel-text')
    expect(urlTab.getAttribute('aria-controls')).toBe('panel-url')
  })

  it('tabpanel has aria-labelledby pointing to the active tab', () => {
    render(<App />)
    const panel = screen.getByRole('tabpanel')
    expect(panel.getAttribute('aria-labelledby')).toBe('tab-text')
  })

  it('active tab has tabIndex 0 and inactive tabs have tabIndex -1', () => {
    render(<App />)
    const textTab = screen.getByRole('tab', { name: 'Текстовый режим' })
    const urlTab = screen.getByRole('tab', { name: 'URL-режим' })
    expect(textTab.getAttribute('tabindex')).toBe('0')
    expect(urlTab.getAttribute('tabindex')).toBe('-1')
  })

  it('ArrowRight on active tab moves focus to next tab', async () => {
    const user = userEvent.setup()
    render(<App />)
    const textTab = screen.getByRole('tab', { name: 'Текстовый режим' })
    textTab.focus()
    await user.keyboard('{ArrowRight}')
    const urlTab = screen.getByRole('tab', { name: 'URL-режим' })
    expect(urlTab.getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(urlTab)
  })

  it('ArrowLeft on first tab wraps to last tab', async () => {
    const user = userEvent.setup()
    render(<App />)
    const textTab = screen.getByRole('tab', { name: 'Текстовый режим' })
    textTab.focus()
    await user.keyboard('{ArrowLeft}')
    const urlTab = screen.getByRole('tab', { name: 'URL-режим' })
    expect(urlTab.getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(urlTab)
  })
})
