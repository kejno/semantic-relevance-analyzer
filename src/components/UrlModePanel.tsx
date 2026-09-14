import { useRef, useState } from 'react'
import { extractText } from '../utils/extractText.ts'

interface UrlModePanelProps {
  onAnalysisComplete: (text: string) => void
  onReset: () => void
}

function isValidHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

const FALLBACK_MESSAGE =
  'Страница недоступна напрямую из браузера — это ожидаемое поведение для большинства сайтов. ' +
  'Скопируйте содержимое страницы и вставьте его ниже.'

export function UrlModePanel({ onAnalysisComplete, onReset }: UrlModePanelProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFallback, setShowFallback] = useState(false)
  const [manualText, setManualText] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const handleLoad = async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setShowFallback(false)
    try {
      const response = await fetch(url, { signal: controller.signal })
      if (!response.ok) {
        setShowFallback(true)
      } else {
        const html = await response.text()
        onAnalysisComplete(extractText(html))
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setShowFallback(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeManual = () => {
    onAnalysisComplete(extractText(manualText))
  }

  const handleReset = () => {
    abortRef.current?.abort()
    setUrl('')
    setManualText('')
    setShowFallback(false)
    setLoading(false)
    onReset()
  }

  return (
    <div className="flex flex-col gap-4 text-left">
      <div className="flex gap-2">
        <input
          type="url"
          aria-label="URL страницы"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 px-3 py-2 border rounded-md text-sm"
          style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
        />
        <button
          type="button"
          onClick={handleLoad}
          disabled={loading || !url.trim() || !isValidHttpUrl(url)}
          className="px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {loading ? 'Загружается…' : 'Загрузить'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          style={{ border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          Сбросить
        </button>
      </div>

      {showFallback && (
        <div className="flex flex-col gap-3">
          <p className="text-sm" style={{ color: 'var(--text)' }}>
            {FALLBACK_MESSAGE}
          </p>
          <textarea
            aria-label="HTML или текст страницы"
            value={manualText}
            onChange={e => setManualText(e.target.value)}
            placeholder="Вставьте HTML или текст страницы"
            rows={8}
            className="w-full px-3 py-2 border rounded-md text-sm font-mono resize-y"
            style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
          />
          <button
            type="button"
            onClick={handleAnalyzeManual}
            disabled={!manualText.trim()}
            className="self-start px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            Анализировать текст
          </button>
        </div>
      )}
    </div>
  )
}
