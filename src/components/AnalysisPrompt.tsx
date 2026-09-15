import { useState } from 'react'

interface AnalysisPromptProps {
  onAnalyze: (query: string) => void
  loading: boolean
  error: string | null
}

export function AnalysisPrompt({ onAnalyze, loading, error }: AnalysisPromptProps) {
  const [query, setQuery] = useState('')

  return (
    <div className="flex flex-col gap-4 text-left">
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
          onClick={() => onAnalyze(query)}
          disabled={query.trim().length === 0 || loading}
          className="self-start px-5 py-2.5 rounded-sm text-sm font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        >
          Анализировать
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
