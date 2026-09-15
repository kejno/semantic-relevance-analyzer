import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UrlModePanel } from '../../src/components/UrlModePanel.tsx'

describe('SRA-21: URL Mode CORS or network error — fallback textarea shown with neutral message', () => {
  let onAnalysisComplete: ReturnType<typeof vi.fn>
  let onReset: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onAnalysisComplete = vi.fn()
    onReset = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('shows fallback textarea when fetch throws TypeError (CORS / network failure)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const user = userEvent.setup({ delay: null })
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={onReset} />)

    fireEvent.change(screen.getByLabelText('URL страницы'), {
      target: { value: 'https://example.com' },
    })
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))

    await waitFor(() =>
      expect(screen.getByLabelText('HTML или текст страницы')).toBeTruthy(),
    )
  })

  it('shows fallback textarea when fetch returns a non-ok response (e.g. 403)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }))

    const user = userEvent.setup({ delay: null })
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={onReset} />)

    fireEvent.change(screen.getByLabelText('URL страницы'), {
      target: { value: 'https://example.com' },
    })
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))

    await waitFor(() =>
      expect(screen.getByLabelText('HTML или текст страницы')).toBeTruthy(),
    )
  })

  it('displays a neutral fallback message without the word "ошибка"', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const user = userEvent.setup({ delay: null })
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={onReset} />)

    fireEvent.change(screen.getByLabelText('URL страницы'), {
      target: { value: 'https://example.com' },
    })
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))

    await waitFor(() =>
      expect(screen.getByLabelText('HTML или текст страницы')).toBeTruthy(),
    )

    const message = screen.getByText(/ожидаемое поведение/i)
    expect(message).toBeTruthy()
    expect(message.textContent).not.toMatch(/ошибка/i)
    expect(message.textContent).not.toMatch(/error/i)
  })

  it('does not call onAnalysisComplete when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const user = userEvent.setup({ delay: null })
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={onReset} />)

    fireEvent.change(screen.getByLabelText('URL страницы'), {
      target: { value: 'https://example.com' },
    })
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))

    await waitFor(() =>
      expect(screen.getByLabelText('HTML или текст страницы')).toBeTruthy(),
    )

    expect(onAnalysisComplete).not.toHaveBeenCalled()
  })
})
