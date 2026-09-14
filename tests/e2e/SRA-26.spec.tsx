import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import { TextModePanel } from '../../src/components/TextModePanel'

// Worker that never responds — keeps the component in loading state indefinitely
class HangingWorker {
  private listeners: ((e: { data: unknown }) => void)[] = []
  addEventListener(_type: string, listener: (e: { data: unknown }) => void) {
    this.listeners.push(listener)
  }
  removeEventListener(_type: string, listener: (e: { data: unknown }) => void) {
    const i = this.listeners.indexOf(listener)
    if (i >= 0) this.listeners.splice(i, 1)
  }
  postMessage(_data: unknown) {
    // Intentionally never dispatches a response so loading stays active
  }
  terminate() {}
}

describe('SRA-26: TextModePanel loading indicator — spinner visible during Worker initialization phase', () => {
  beforeEach(() => {
    vi.stubGlobal('Worker', HangingWorker)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('loading indicator is not visible before analysis starts', () => {
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('loading indicator appears immediately after Анализировать is clicked', async () => {
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)

    fireEvent.change(
      screen.getByPlaceholderText('Вставьте текст для анализа'),
      { target: { value: 'Some text content to analyze here' } },
    )
    fireEvent.change(
      screen.getByPlaceholderText('Целевое ключевое слово или промпт'),
      { target: { value: 'keyword' } },
    )

    fireEvent.click(screen.getByRole('button', { name: 'Анализировать' }))

    // Flush the synchronous setLoading(true) state update
    await act(async () => { await Promise.resolve() })

    expect(screen.queryByRole('status')).not.toBeNull()
  })

  it('loading indicator has accessible label "Загрузка"', async () => {
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)

    fireEvent.change(
      screen.getByPlaceholderText('Вставьте текст для анализа'),
      { target: { value: 'Some text content to analyze here' } },
    )
    fireEvent.change(
      screen.getByPlaceholderText('Целевое ключевое слово или промпт'),
      { target: { value: 'keyword' } },
    )

    fireEvent.click(screen.getByRole('button', { name: 'Анализировать' }))
    await act(async () => { await Promise.resolve() })

    const spinner = screen.getByRole('status')
    expect(spinner.getAttribute('aria-label')).toBe('Загрузка')
  })

  it('Анализировать button is disabled while loading', async () => {
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)

    fireEvent.change(
      screen.getByPlaceholderText('Вставьте текст для анализа'),
      { target: { value: 'Some text content to analyze here' } },
    )
    fireEvent.change(
      screen.getByPlaceholderText('Целевое ключевое слово или промпт'),
      { target: { value: 'keyword' } },
    )

    fireEvent.click(screen.getByRole('button', { name: 'Анализировать' }))
    await act(async () => { await Promise.resolve() })

    const analyzeBtn = screen.getByRole('button', { name: 'Анализировать' }) as HTMLButtonElement
    expect(analyzeBtn.disabled).toBe(true)
  })
})
