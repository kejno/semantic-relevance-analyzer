import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UrlModePanel } from '../../src/components/UrlModePanel.tsx'

async function triggerFallback(user: ReturnType<typeof userEvent.setup>) {
  fireEvent.change(screen.getByLabelText('URL страницы'), {
    target: { value: 'https://example.com' },
  })
  await user.click(screen.getByRole('button', { name: 'Загрузить' }))
  await waitFor(() => expect(screen.getByLabelText('HTML или текст страницы')).toBeTruthy())
}

describe('SRA-23: URL Mode reset button — URL input, fallback textarea, and results cleared', () => {
  let onAnalysisComplete: ReturnType<typeof vi.fn>
  let onReset: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onAnalysisComplete = vi.fn()
    onReset = vi.fn()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('clears the URL input after clicking Сбросить', async () => {
    const user = userEvent.setup({ delay: null })
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={onReset} />)

    await triggerFallback(user)

    await user.click(screen.getByRole('button', { name: 'Сбросить' }))

    expect((screen.getByLabelText('URL страницы') as HTMLInputElement).value).toBe('')
  })

  it('hides the fallback textarea after clicking Сбросить', async () => {
    const user = userEvent.setup({ delay: null })
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={onReset} />)

    await triggerFallback(user)

    expect(screen.getByLabelText('HTML или текст страницы')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Сбросить' }))

    expect(screen.queryByLabelText('HTML или текст страницы')).toBeNull()
  })

  it('clears the fallback textarea content after clicking Сбросить', async () => {
    const user = userEvent.setup({ delay: null })
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={onReset} />)

    await triggerFallback(user)

    fireEvent.change(screen.getByLabelText('HTML или текст страницы'), {
      target: { value: 'Some pasted content' },
    })
    expect(
      (screen.getByLabelText('HTML или текст страницы') as HTMLTextAreaElement).value,
    ).toBe('Some pasted content')

    await user.click(screen.getByRole('button', { name: 'Сбросить' }))

    expect(screen.queryByLabelText('HTML или текст страницы')).toBeNull()
  })

  it('calls onReset callback when Сбросить is clicked', async () => {
    const user = userEvent.setup({ delay: null })
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={onReset} />)

    await triggerFallback(user)

    await user.click(screen.getByRole('button', { name: 'Сбросить' }))

    expect(onReset).toHaveBeenCalledOnce()
  })

  it('can reset without triggering the fallback first (button always available)', async () => {
    const user = userEvent.setup({ delay: null })
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={onReset} />)

    fireEvent.change(screen.getByLabelText('URL страницы'), {
      target: { value: 'https://example.com' },
    })
    await user.click(screen.getByRole('button', { name: 'Сбросить' }))

    expect((screen.getByLabelText('URL страницы') as HTMLInputElement).value).toBe('')
    expect(onReset).toHaveBeenCalledOnce()
  })
})
