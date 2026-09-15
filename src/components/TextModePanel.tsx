import { useState, useRef, useEffect } from 'react'
import { cosineSimilarity } from '../utils/similarity'

export type AnalysisResult = { text: string; score: number }

function vectorizeText(worker: Worker, id: number, text: string): Promise<number[]> {
  return new Promise<number[]>((resolve, reject) => {
    const handler = (e: MessageEvent<{ id: number; vector?: number[]; error?: string }>) => {
      if (e.data.id !== id) return
      worker.removeEventListener('message', handler as EventListener)
      if (e.data.error) reject(new Error(e.data.error))
      else if (e.data.vector !== undefined) resolve(e.data.vector)
      else reject(new Error('Worker returned no vector'))
    }
    worker.addEventListener('message', handler as EventListener)
    worker.postMessage({ id, text })
  })
}

interface Props {
  onAnalysisComplete: (results: AnalysisResult[]) => void
}

export function TextModePanel({ onAnalysisComplete }: Props) {
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const idRef = useRef(0)

  useEffect(() => {
    return () => { workerRef.current?.terminate() }
  }, [])

  function getWorker(): Worker {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/embeddings.worker.ts', import.meta.url),
        { type: 'module' },
      )
    }
    return workerRef.current
  }

  async function handleAnalyze() {
    setLoading(true)
    setError(null)
    try {
      const worker = getWorker()
      const queryVector = await vectorizeText(worker, idRef.current++, query)

      const passages = text
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0)

      const results: AnalysisResult[] = []
      for (const passage of passages) {
        const vec = await vectorizeText(worker, idRef.current++, passage)
        results.push({ text: passage, score: cosineSimilarity(queryVector, vec) })
      }

      onAnalysisComplete(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка анализа')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setText('')
    setQuery('')
    setError(null)
    onAnalysisComplete([])
  }

  const canAnalyze = text.trim().length > 0 && query.trim().length > 0

  return (
    <div className="flex flex-col gap-4 text-left">
      <textarea
        aria-label="Текст для анализа"
        placeholder="Вставьте текст для анализа"
        value={text}
        onChange={e => setText(e.target.value)}
        rows={8}
        className="w-full rounded-sm border px-3 py-2.5 text-sm resize-y transition-colors focus:outline-none"
        style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
      />
      <input
        type="text"
        aria-label="Целевое ключевое слово или промпт"
        placeholder="Целевое ключевое слово или промпт"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full rounded-sm border px-3 py-2.5 text-sm transition-colors focus:outline-none"
        style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
      />
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => void handleAnalyze()}
          disabled={!canAnalyze || loading}
          className="px-5 py-2.5 rounded-sm text-sm font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        >
          Анализировать
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="text-sm font-medium transition-colors disabled:opacity-40"
          style={{ color: 'var(--text)' }}
        >
          Сбросить
        </button>
        {loading && (
          <span role="status" aria-label="Загрузка" className="text-sm" style={{ color: 'var(--text)' }}>
            Анализируем…
          </span>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm" style={{ color: '#b3492f' }}>{error}</p>
      )}
    </div>
  )
}
