import { useRef, useState, useEffect, useCallback } from 'react'
import { cosineSimilarity } from '../utils/similarity'
import { segmentText } from '../utils/segmentation'

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

export function useSemanticAnalysis() {
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

  const analyze = useCallback(async (text: string, query: string): Promise<AnalysisResult[]> => {
    setLoading(true)
    setError(null)
    try {
      const worker = getWorker()
      const queryVector = await vectorizeText(worker, idRef.current++, query)

      const passages = segmentText(text)

      const results: AnalysisResult[] = []
      for (const passage of passages) {
        const vec = await vectorizeText(worker, idRef.current++, passage)
        results.push({ text: passage, score: cosineSimilarity(queryVector, vec) })
      }

      return results
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка анализа')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return { analyze, loading, error, setError }
}
