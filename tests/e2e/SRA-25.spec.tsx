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

describe('SRA-25: TextModePanel Analyze button — disabled when either field is empty', () => {
  beforeEach(() => {
    vi.stubGlobal('Worker', StubWorker)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('button is disabled when both fields are empty', () => {
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    const btn = screen.getByRole('button', { name: 'Анализировать' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('button is disabled when only text textarea is filled', async () => {
    const user = userEvent.setup()
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('Вставьте текст для анализа'), 'some text')
    const btn = screen.getByRole('button', { name: 'Анализировать' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('button is disabled when only query field is filled', async () => {
    const user = userEvent.setup()
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('Целевое ключевое слово или промпт'), 'keyword')
    const btn = screen.getByRole('button', { name: 'Анализировать' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('button is enabled when both fields are filled', async () => {
    const user = userEvent.setup()
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('Вставьте текст для анализа'), 'some text here')
    await user.type(screen.getByPlaceholderText('Целевое ключевое слово или промпт'), 'keyword')
    const btn = screen.getByRole('button', { name: 'Анализировать' }) as HTMLButtonElement
    expect(btn.disabled).toBe(false)
  })

  it('button becomes disabled again when text field is cleared', async () => {
    const user = userEvent.setup()
    render(<TextModePanel onAnalysisComplete={vi.fn()} />)
    const textarea = screen.getByPlaceholderText('Вставьте текст для анализа')
    const queryInput = screen.getByPlaceholderText('Целевое ключевое слово или промпт')
    await user.type(textarea, 'some text')
    await user.type(queryInput, 'keyword')
    await user.clear(textarea)
    const btn = screen.getByRole('button', { name: 'Анализировать' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })
})
