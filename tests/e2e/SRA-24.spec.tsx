import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act, waitFor } from '@testing-library/react'
import { TextModePanel, type AnalysisResult } from '../../src/components/TextModePanel'

describe('SRA-24: TextModePanel analysis happy path — loading state shown then results lifted to parent', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('transitions to loading state after clicking Анализировать', async () => {
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
      { target: { value: 'This passage contains enough words to pass the twenty word minimum threshold for analysis.' } },
    )
    fireEvent.change(
      screen.getByPlaceholderText('Целевое ключевое слово или промпт'),
      { target: { value: 'keyword' } },
    )

    fireEvent.click(screen.getByRole('button', { name: 'Анализировать' }))
    await act(async () => { await Promise.resolve() })

    // Loading indicator must be present while Worker has not responded
    expect(screen.queryByRole('status')).not.toBeNull()
  })

  it('calls onAnalysisComplete with results and removes loading indicator after Worker responds', async () => {
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

    const onComplete = vi.fn()
    render(<TextModePanel onAnalysisComplete={onComplete} />)

    const passageText =
      'This passage contains enough words to pass the twenty word minimum threshold for analysis output.'

    fireEvent.change(
      screen.getByPlaceholderText('Вставьте текст для анализа'),
      { target: { value: passageText } },
    )
    fireEvent.change(
      screen.getByPlaceholderText('Целевое ключевое слово или промпт'),
      { target: { value: 'keyword' } },
    )

    fireEvent.click(screen.getByRole('button', { name: 'Анализировать' }))
    await act(async () => { await Promise.resolve() })

    // Verify loading state while Worker is paused
    expect(screen.queryByRole('status')).not.toBeNull()

    // Deliver Worker responses: first the query vector, then the passage vector
    await act(async () => {
      responseQueue.shift()!()   // query vectorization
      await Promise.resolve()    // let handleAnalyze send next postMessage
      responseQueue.shift()!()   // passage vectorization
      await Promise.resolve()    // let handleAnalyze finish
    })

    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce())

    const results = onComplete.mock.calls[0][0] as AnalysisResult[]
    expect(results.length).toBeGreaterThan(0)
    expect(typeof results[0].text).toBe('string')
    expect(typeof results[0].score).toBe('number')

    // Loading indicator disappears after analysis completes
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('result scores are numbers in the [0, 1] range', async () => {
    class ImmediateWorker {
      private listeners: ((e: { data: unknown }) => void)[] = []
      addEventListener(_: string, l: (e: { data: unknown }) => void) { this.listeners.push(l) }
      removeEventListener(_: string, l: (e: { data: unknown }) => void) {
        const i = this.listeners.indexOf(l)
        if (i >= 0) this.listeners.splice(i, 1)
      }
      postMessage(data: { id: number }) {
        const ls = [...this.listeners]
        ls.forEach(fn => fn({ data: { id: data.id, vector: [1, 0, 0] } }))
      }
      terminate() {}
    }

    vi.stubGlobal('Worker', ImmediateWorker)

    const onComplete = vi.fn()
    render(<TextModePanel onAnalysisComplete={onComplete} />)

    fireEvent.change(
      screen.getByPlaceholderText('Вставьте текст для анализа'),
      { target: { value: 'This passage has more than twenty words to ensure it passes the minimum word threshold for segmentation.' } },
    )
    fireEvent.change(
      screen.getByPlaceholderText('Целевое ключевое слово или промпт'),
      { target: { value: 'keyword' } },
    )

    fireEvent.click(screen.getByRole('button', { name: 'Анализировать' }))

    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce())

    const results = onComplete.mock.calls[0][0] as AnalysisResult[]
    for (const r of results) {
      expect(r.score).toBeGreaterThanOrEqual(0)
      expect(r.score).toBeLessThanOrEqual(1)
    }
  })

  it('beforeEach: loading indicator is not shown before any interaction', () => {
    class ImmediateWorker {
      private listeners: ((e: { data: unknown }) => void)[] = []
      addEventListener(_: string, l: (e: { data: unknown }) => void) { this.listeners.push(l) }
      removeEventListener(_: string, l: (e: { data: unknown }) => void) {
        const i = this.listeners.indexOf(l)
        if (i >= 0) this.listeners.splice(i, 1)
      }
      postMessage(data: { id: number }) {
        const ls = [...this.listeners]
        ls.forEach(fn => fn({ data: { id: data.id, vector: [1, 0, 0] } }))
      }
      terminate() {}
    }

    vi.stubGlobal('Worker', ImmediateWorker)
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    expect(screen.queryByRole('status')).toBeNull()
  })
})
