import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
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
    const onComplete = vi.fn()
    const user = userEvent.setup()
    render(<TextModePanel onAnalysisComplete={onComplete} />)
    await user.click(screen.getByRole('button', { name: 'Сбросить' }))
    expect(onComplete).toHaveBeenCalledWith([])
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
