import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UrlModePanel } from '../../src/components/UrlModePanel.tsx'

describe('UrlModePanel', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders URL input and Загрузить button', () => {
    render(<UrlModePanel onAnalysisComplete={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: 'URL страницы' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Загрузить' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Сбросить' })).toBeDefined()
  })

  it('integration: successful fetch — extracts text without script/style and calls onAnalysisComplete', async () => {
    const html =
      '<html><body><script>var x = 1</script><style>p{color:red}</style>' +
      '<p>Hello world content</p></body></html>'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(html) }),
    )

    const onAnalysisComplete = vi.fn()
    const user = userEvent.setup()
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={vi.fn()} />)

    await user.type(screen.getByRole('textbox', { name: 'URL страницы' }), 'https://example.com')
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))

    await waitFor(() => expect(onAnalysisComplete).toHaveBeenCalledOnce())
    const text: string = onAnalysisComplete.mock.calls[0][0]
    expect(text).toContain('Hello world content')
    expect(text).not.toContain('var x = 1')
    expect(text).not.toContain('color:red')
  })

  it('integration: fetch TypeError — shows fallback textarea and Анализировать текст button', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const onAnalysisComplete = vi.fn()
    const user = userEvent.setup()
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={vi.fn()} />)

    await user.type(screen.getByRole('textbox', { name: 'URL страницы' }), 'https://example.com')
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))

    await waitFor(() =>
      expect(screen.queryByRole('textbox', { name: 'HTML или текст страницы' })).not.toBeNull(),
    )
    expect(screen.getByRole('button', { name: 'Анализировать текст' })).toBeDefined()
    expect(onAnalysisComplete).not.toHaveBeenCalled()
  })

  it('integration: fetch TypeError then manual text — Анализировать текст calls onAnalysisComplete', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const onAnalysisComplete = vi.fn()
    const user = userEvent.setup()
    render(<UrlModePanel onAnalysisComplete={onAnalysisComplete} onReset={vi.fn()} />)

    await user.type(screen.getByRole('textbox', { name: 'URL страницы' }), 'https://example.com')
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))

    await waitFor(() =>
      expect(screen.queryByRole('textbox', { name: 'HTML или текст страницы' })).not.toBeNull(),
    )

    await user.type(
      screen.getByRole('textbox', { name: 'HTML или текст страницы' }),
      '<p>Pasted content</p>',
    )
    await user.click(screen.getByRole('button', { name: 'Анализировать текст' }))

    await waitFor(() => expect(onAnalysisComplete).toHaveBeenCalledOnce())
    expect(onAnalysisComplete.mock.calls[0][0]).toContain('Pasted content')
  })

  it('Сбросить clears URL input, hides fallback textarea, and calls onReset', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const onReset = vi.fn()
    const user = userEvent.setup()
    render(<UrlModePanel onAnalysisComplete={vi.fn()} onReset={onReset} />)

    await user.type(screen.getByRole('textbox', { name: 'URL страницы' }), 'https://example.com')
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))

    await waitFor(() =>
      expect(screen.queryByRole('textbox', { name: 'HTML или текст страницы' })).not.toBeNull(),
    )

    await user.click(screen.getByRole('button', { name: 'Сбросить' }))

    expect((screen.getByRole('textbox', { name: 'URL страницы' }) as HTMLInputElement).value).toBe('')
    expect(screen.queryByRole('textbox', { name: 'HTML или текст страницы' })).toBeNull()
    expect(onReset).toHaveBeenCalledOnce()
  })

  it('fetch non-2xx response also shows fallback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403, text: vi.fn() }))

    const user = userEvent.setup()
    render(<UrlModePanel onAnalysisComplete={vi.fn()} onReset={vi.fn()} />)

    await user.type(screen.getByRole('textbox', { name: 'URL страницы' }), 'https://example.com')
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))

    await waitFor(() =>
      expect(screen.queryByRole('textbox', { name: 'HTML или текст страницы' })).not.toBeNull(),
    )
  })

  it('Загрузить is disabled for a URL without http/https scheme', async () => {
    const user = userEvent.setup()
    render(<UrlModePanel onAnalysisComplete={vi.fn()} onReset={vi.fn()} />)

    await user.type(screen.getByRole('textbox', { name: 'URL страницы' }), 'example.com')

    expect(screen.getByRole('button', { name: 'Загрузить' })).toHaveProperty('disabled', true)
  })
})
