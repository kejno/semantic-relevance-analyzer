import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextModePanel } from '../../src/components/TextModePanel'

class StubWorker {
  addEventListener() {}
  removeEventListener() {}
  postMessage() {}
  terminate() {}
}

describe('SRA-27: TextModePanel Reset button — clears inputs and resets results state', () => {
  beforeEach(() => {
    vi.stubGlobal('Worker', StubWorker)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('clicking Сбросить clears the text textarea', async () => {
    const user = userEvent.setup()
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('Вставьте текст для анализа'), 'some text')
    await user.click(screen.getByRole('button', { name: 'Сбросить' }))
    const textarea = screen.getByPlaceholderText('Вставьте текст для анализа') as HTMLTextAreaElement
    expect(textarea.value).toBe('')
  })

  it('clicking Сбросить clears the query input', async () => {
    const user = userEvent.setup()
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('Целевое ключевое слово или промпт'), 'keyword')
    await user.click(screen.getByRole('button', { name: 'Сбросить' }))
    const input = screen.getByPlaceholderText('Целевое ключевое слово или промпт') as HTMLInputElement
    expect(input.value).toBe('')
  })

  it('clicking Сбросить calls onAnalysisComplete with an empty array', async () => {
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

    await waitFor(() =>
      expect(onComplete).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ text: expect.any(String), score: expect.any(Number) }),
        ]),
      ),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Сбросить' }))
    expect(onComplete).toHaveBeenLastCalledWith([])
  })

  it('clicking Сбросить re-disables the Анализировать button after fields were filled', async () => {
    const user = userEvent.setup()
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('Вставьте текст для анализа'), 'text')
    await user.type(screen.getByPlaceholderText('Целевое ключевое слово или промпт'), 'query')
    // Verify enabled before reset
    const btn = screen.getByRole('button', { name: 'Анализировать' }) as HTMLButtonElement
    expect(btn.disabled).toBe(false)
    await user.click(screen.getByRole('button', { name: 'Сбросить' }))
    expect(btn.disabled).toBe(true)
  })
})
