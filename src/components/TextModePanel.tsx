import { useState, useRef, useEffect } from 'react'
import { cosineSimilarity } from '../utils/similarity'

export type AnalysisResult = { text: string; score: number }

function vectorizeText(worker: Worker, id: number, text: string): Promise<number[]> {
  return new Promise<number[]>((resolve, reject) => {
    const handler = (e: MessageEvent<{ id: number; vector?: number[]; error?: string }>) => {
      if (e.data.id !== id) return
      worker.removeEventListener('message', handler as EventListener)
      if (e.data.error) reject(new Error(e.data.error))
      else resolve(e.data.vector!)
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
        className="w-full rounded border p-3 text-sm resize-y"
        style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
      />
      <input
        type="text"
        aria-label="Целевое ключевое слово или промпт"
        placeholder="Целевое ключевое слово или промпт"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full rounded border p-3 text-sm"
        style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
      />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => void handleAnalyze()}
          disabled={!canAnalyze || loading}
          className="px-5 py-2 rounded text-sm font-medium transition-colors"
          style={{
            background: canAnalyze && !loading ? 'var(--accent)' : 'var(--border)',
            color: canAnalyze && !loading ? '#fff' : 'var(--text)',
            cursor: canAnalyze && !loading ? 'pointer' : 'not-allowed',
          }}
        >
          Анализировать
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="px-5 py-2 rounded border text-sm font-medium transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          Сбросить
        </button>
      </div>
      {loading && (
        <div role="status" aria-label="Загрузка" className="text-sm" style={{ color: 'var(--accent)' }}>
          Анализируем…
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
