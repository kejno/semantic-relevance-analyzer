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

describe('SRA-22: URL Mode manual paste in fallback textarea — analysis pipeline triggered via DOMParser', () => {
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

  it('calls onAnalysisComplete when plain text is pasted and Анализировать текст is clicked', async () => {
    const user = userEvent.setup({ delay: null })
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={onReset} />)

    await triggerFallback(user)

    fireEvent.change(screen.getByLabelText('HTML или текст страницы'), {
      target: { value: 'Plain text content for analysis' },
    })
    await user.click(screen.getByRole('button', { name: 'Анализировать текст' }))

    expect(onAnalysisComplete).toHaveBeenCalledOnce()
    expect(onAnalysisComplete.mock.calls[0][0]).toContain('Plain text content for analysis')
  })

  it('strips script and style tags from pasted HTML via DOMParser before calling onAnalysisComplete', async () => {
    const user = userEvent.setup({ delay: null })
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={onReset} />)

    await triggerFallback(user)

    const pastedHtml = '<p>Article body</p><script>malicious()</script><style>body{color:red}</style>'
    fireEvent.change(screen.getByLabelText('HTML или текст страницы'), {
      target: { value: pastedHtml },
    })
    await user.click(screen.getByRole('button', { name: 'Анализировать текст' }))

    expect(onAnalysisComplete).toHaveBeenCalledOnce()
    const text: string = onAnalysisComplete.mock.calls[0][0]
    expect(text).toContain('Article body')
    expect(text).not.toContain('malicious()')
    expect(text).not.toContain('color:red')
  })

  it('Анализировать текст button is disabled when fallback textarea is empty', async () => {
    const user = userEvent.setup({ delay: null })
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={onReset} />)

    await triggerFallback(user)

    expect(
      (screen.getByRole('button', { name: 'Анализировать текст' }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })

  it('uses the same onAnalysisComplete callback as Text Mode pipeline', async () => {
    const user = userEvent.setup({ delay: null })
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={onReset} />)

    await triggerFallback(user)

    fireEvent.change(screen.getByLabelText('HTML или текст страницы'), {
      target: { value: 'Some content to analyze' },
    })
    await user.click(screen.getByRole('button', { name: 'Анализировать текст' }))

    expect(onAnalysisComplete).toHaveBeenCalledOnce()
    expect(typeof onAnalysisComplete.mock.calls[0][0]).toBe('string')
  })
})
