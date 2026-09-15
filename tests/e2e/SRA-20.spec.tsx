import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UrlModePanel } from '../../src/components/UrlModePanel.tsx'

describe('SRA-20: URL Mode successful fetch — page text extracted and analysis pipeline triggered', () => {
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

  it('calls onAnalysisComplete with extracted text when fetch succeeds', async () => {
    const html =
      '<html><body><script>alert(1)</script><style>body{color:red}</style><p>Article content</p></body></html>'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(html) }),
    )

    const user = userEvent.setup({ delay: null })
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={onReset} />)

    fireEvent.change(screen.getByLabelText('URL страницы'), {
      target: { value: 'https://example.com' },
    })
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))

    await waitFor(() => expect(onAnalysisComplete).toHaveBeenCalledOnce())

    const extracted: string = onAnalysisComplete.mock.calls[0][0]
    expect(extracted).toContain('Article content')
    expect(extracted).not.toContain('alert(1)')
    expect(extracted).not.toContain('color:red')
  })

  it('strips script and style tags via DOMParser before passing text to callback', async () => {
    const html =
      '<html><body><p>Main body</p><script>injected()</script><noscript>no-js</noscript></body></html>'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(html) }),
    )

    const user = userEvent.setup({ delay: null })
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={onReset} />)

    fireEvent.change(screen.getByLabelText('URL страницы'), {
      target: { value: 'https://example.com' },
    })
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))

    await waitFor(() => expect(onAnalysisComplete).toHaveBeenCalledOnce())

    const extracted: string = onAnalysisComplete.mock.calls[0][0]
    expect(extracted).toContain('Main body')
    expect(extracted).not.toContain('injected()')
    expect(extracted).not.toContain('no-js')
  })

  it('does not show fallback textarea when fetch succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<html><body><p>text</p></body></html>'),
      }),
    )

    const user = userEvent.setup({ delay: null })
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={onReset} />)

    fireEvent.change(screen.getByLabelText('URL страницы'), {
      target: { value: 'https://example.com' },
    })
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))

    await waitFor(() => expect(onAnalysisComplete).toHaveBeenCalledOnce())

    expect(screen.queryByLabelText('HTML или текст страницы')).toBeNull()
  })
})
