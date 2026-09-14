import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App.tsx'

describe('App', () => {
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
})
