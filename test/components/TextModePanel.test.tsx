import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextModePanel, type AnalysisResult } from '../../src/components/TextModePanel'

class ImmediateMockWorker {
  private listeners: ((e: { data: unknown }) => void)[] = []

  addEventListener(_type: string, listener: (e: { data: unknown }) => void) {
    this.listeners.push(listener)
  }

  removeEventListener(_type: string, listener: (e: { data: unknown }) => void) {
    const i = this.listeners.indexOf(listener)
    if (i >= 0) this.listeners.splice(i, 1)
  }

  postMessage(data: { id: number; text: string }) {
    const evt = { data: { id: data.id, vector: [1, 0, 0] } }
    this.listeners.forEach(fn => fn(evt))
  }

  terminate() {}
}

describe('TextModePanel', () => {
  beforeEach(() => {
    vi.stubGlobal('Worker', ImmediateMockWorker)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders textarea with correct placeholder', () => {
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    expect(screen.getByPlaceholderText('Вставьте текст для анализа')).toBeDefined()
  })

  it('renders query input with correct placeholder', () => {
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    expect(screen.getByPlaceholderText('Целевое ключевое слово или промпт')).toBeDefined()
  })

  it('renders Анализировать and Сбросить buttons', () => {
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Анализировать' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Сбросить' })).toBeDefined()
  })

  it('Анализировать button is disabled when both fields are empty', () => {
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    const btn = screen.getByRole('button', { name: 'Анализировать' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('Анализировать button is disabled when only text field is filled', async () => {
    const user = userEvent.setup()
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('Вставьте текст для анализа'), 'some text')
    const btn = screen.getByRole('button', { name: 'Анализировать' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('Анализировать button is disabled when only query field is filled', async () => {
    const user = userEvent.setup()
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('Целевое ключевое слово или промпт'), 'keyword')
    const btn = screen.getByRole('button', { name: 'Анализировать' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('Анализировать button is enabled when both fields are filled', async () => {
    const user = userEvent.setup()
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('Вставьте текст для анализа'), 'some text here')
    await user.type(screen.getByPlaceholderText('Целевое ключевое слово или промпт'), 'keyword')
    const btn = screen.getByRole('button', { name: 'Анализировать' }) as HTMLButtonElement
    expect(btn.disabled).toBe(false)
  })

  it('clicking Сбросить clears both input fields', async () => {
    const user = userEvent.setup()
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('Вставьте текст для анализа'), 'some text')
    await user.type(screen.getByPlaceholderText('Целевое ключевое слово или промпт'), 'keyword')
    await user.click(screen.getByRole('button', { name: 'Сбросить' }))
    expect((screen.getByPlaceholderText('Вставьте текст для анализа') as HTMLTextAreaElement).value).toBe('')
    expect((screen.getByPlaceholderText('Целевое ключевое слово или промпт') as HTMLInputElement).value).toBe('')
  })

  it('clicking Сбросить calls onAnalysisComplete with empty array', async () => {
    const onComplete = vi.fn()
    const user = userEvent.setup()
    render(<TextModePanel onAnalysisComplete={onComplete} />)
    await user.click(screen.getByRole('button', { name: 'Сбросить' }))
    expect(onComplete).toHaveBeenCalledWith([])
  })

  // Integration test per SRA-12:
  // enter text + query → click Анализировать (worker mocked) →
  // verify loading state → after resolve verify results passed
  it('integration: shows loading indicator then calls onAnalysisComplete with results', async () => {
    const responseQueue: (() => void)[] = []

    class PausedWorker {
      private listeners: ((e: { data: unknown }) => void)[] = []
      addEventListener(_: string, l: (e: { data: unknown }) => void) { this.listeners.push(l) }
      removeEventListener(_: string, l: (e: { data: unknown }) => void) {
        const i = this.listeners.indexOf(l)
        if (i >= 0) this.listeners.splice(i, 1)
      }
      postMessage(data: { id: number; text: string }) {
        const ls = [...this.listeners]
        const { id } = data
        responseQueue.push(() => ls.forEach(fn => fn({ data: { id, vector: [1, 0, 0] } })))
      }
      terminate() {}
    }

    vi.stubGlobal('Worker', PausedWorker)

    const onComplete = vi.fn()
    render(<TextModePanel onAnalysisComplete={onComplete} />)

    const text = 'This is a long enough passage for analysis testing because it contains more than twenty words total here.'

    fireEvent.change(
      screen.getByPlaceholderText('Вставьте текст для анализа'),
      { target: { value: text } }
    )
    fireEvent.change(
      screen.getByPlaceholderText('Целевое ключевое слово или промпт'),
      { target: { value: 'keyword' } }
    )

    // Click analyze — do not await so we can observe the loading state
    fireEvent.click(screen.getByRole('button', { name: 'Анализировать' }))

    // Flush setLoading(true) update; worker is paused so promise stays pending
    await act(async () => { await Promise.resolve() })

    // Component should be in loading state
    expect(screen.queryByRole('status')).not.toBeNull()

    // Deliver worker responses sequentially (query vector, then passage vector)
    await act(async () => {
      responseQueue.shift()!()      // query vectorization response
      await Promise.resolve()       // allow handleAnalyze to continue and send next postMessage
      responseQueue.shift()!()      // passage vectorization response
      await Promise.resolve()       // allow handleAnalyze to finish
    })

    // Results should have been passed to the callback
    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce())

    const results = onComplete.mock.calls[0][0] as AnalysisResult[]
    expect(results.length).toBeGreaterThan(0)
    expect(typeof results[0].text).toBe('string')
    expect(typeof results[0].score).toBe('number')

    // Loading indicator should be gone
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('integration: two passages each appear as separate result entries', async () => {
    const onComplete = vi.fn()
    const user = userEvent.setup()
    render(<TextModePanel onAnalysisComplete={onComplete} />)

    const p1 = 'This first passage contains enough words to be its own separate segment for analysis testing.'
    const p2 = 'This second passage also contains enough words to be its own separate segment for testing analysis.'
    const text = `${p1}\n\n${p2}`

    await user.type(screen.getByPlaceholderText('Вставьте текст для анализа'), text)
    await user.type(screen.getByPlaceholderText('Целевое ключевое слово или промпт'), 'keyword')
    await user.click(screen.getByRole('button', { name: 'Анализировать' }))

    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce())

    const results = onComplete.mock.calls[0][0] as AnalysisResult[]
    expect(results.length).toBeGreaterThanOrEqual(2)
  })

  it('Сбросить button is disabled while analysis is loading', async () => {
    const responseQueue: (() => void)[] = []

    class PausedWorker {
      private listeners: ((e: { data: unknown }) => void)[] = []
      addEventListener(_: string, l: (e: { data: unknown }) => void) { this.listeners.push(l) }
      removeEventListener(_: string, l: (e: { data: unknown }) => void) {
        const i = this.listeners.indexOf(l)
        if (i >= 0) this.listeners.splice(i, 1)
      }
      postMessage(data: { id: number }) {
        const ls = [...this.listeners]
        const { id } = data
        responseQueue.push(() => ls.forEach(fn => fn({ data: { id, vector: [1, 0, 0] } })))
      }
      terminate() {}
    }

    vi.stubGlobal('Worker', PausedWorker)

    render(<TextModePanel onAnalysisComplete={vi.fn()} />)

    fireEvent.change(
      screen.getByPlaceholderText('Вставьте текст для анализа'),
      { target: { value: 'some text for analysis' } }
    )
    fireEvent.change(
      screen.getByPlaceholderText('Целевое ключевое слово или промпт'),
      { target: { value: 'keyword' } }
    )

    fireEvent.click(screen.getByRole('button', { name: 'Анализировать' }))

    await act(async () => { await Promise.resolve() })

    const resetBtn = screen.getByRole('button', { name: 'Сбросить' }) as HTMLButtonElement
    expect(resetBtn.disabled).toBe(true)
  })

  it('shows error message when worker returns an error', async () => {
    class ErrorWorker {
      private listeners: ((e: { data: unknown }) => void)[] = []
      addEventListener(_: string, l: (e: { data: unknown }) => void) { this.listeners.push(l) }
      removeEventListener(_: string, l: (e: { data: unknown }) => void) {
        const i = this.listeners.indexOf(l)
        if (i >= 0) this.listeners.splice(i, 1)
      }
      postMessage(data: { id: number }) {
        this.listeners.forEach(fn => fn({ data: { id: data.id, error: 'Model load failed' } }))
      }
      terminate() {}
    }

    vi.stubGlobal('Worker', ErrorWorker)

    const user = userEvent.setup()
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('Вставьте текст для анализа'), 'some text here')
    await user.type(screen.getByPlaceholderText('Целевое ключевое слово или промпт'), 'keyword')
    await user.click(screen.getByRole('button', { name: 'Анализировать' }))

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeNull())

    expect(screen.getByRole('alert').textContent).toContain('Model load failed')
    expect(screen.queryByRole('status')).toBeNull()
  })
})
