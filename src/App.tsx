import { useState } from 'react'
import './App.css'
import { TextModePanel, type AnalysisResult } from './components/TextModePanel'
import { UrlModePanel } from './components/UrlModePanel.tsx'
import { AnalysisPrompt } from './components/AnalysisPrompt'
import { PassageList } from './components/PassageList'
import { ContentFlowChart } from './components/ContentFlowChart'
import { useSemanticAnalysis } from './hooks/useSemanticAnalysis'

type Tab = 'text' | 'url'

const TABS: Tab[] = ['text', 'url']

function ResultsSection({ passages }: { passages: AnalysisResult[] }) {
  if (passages.length === 0) return <PassageList passages={passages} />
  return (
    <div className="flex flex-col gap-8">
      <ContentFlowChart passages={passages} />
      <PassageList passages={passages} />
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('text')
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [analysisText, setAnalysisText] = useState<string | null>(null)
  const [urlResults, setUrlResults] = useState<AnalysisResult[]>([])
  const urlAnalysis = useSemanticAnalysis()

  const handleAnalysisComplete = (text: string) => {
    setAnalysisText(text)
    setUrlResults([])
  }

  const handleReset = () => {
    setAnalysisText(null)
    setUrlResults([])
  }

  const handleUrlAnalyze = async (query: string) => {
    if (!analysisText) return
    const analysisResults = await urlAnalysis.analyze(analysisText, query)
    setUrlResults(analysisResults)
  }

  const handleKeyDown = (e: React.KeyboardEvent, current: Tab) => {
    const idx = TABS.indexOf(current)
    let next: Tab | undefined
    if (e.key === 'ArrowRight') next = TABS[(idx + 1) % TABS.length]
    if (e.key === 'ArrowLeft')  next = TABS[(idx - 1 + TABS.length) % TABS.length]
    if (next) {
      e.preventDefault()
      setActiveTab(next)
      document.getElementById(`tab-${next}`)?.focus()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <h1>Semantic Relevance Analyzer</h1>
      <p className="text-sm" style={{ color: 'var(--text)' }}>
        Измерьте, насколько каждый фрагмент текста отвечает на целевой запрос.
      </p>

      <div role="tablist" className="flex gap-1 mt-8 border-b" style={{ borderColor: 'var(--border)' }}>
        <button
          id="tab-text"
          type="button"
          role="tab"
          aria-selected={activeTab === 'text'}
          aria-controls="tabpanel"
          tabIndex={activeTab === 'text' ? 0 : -1}
          onClick={() => setActiveTab('text')}
          onKeyDown={(e) => handleKeyDown(e, 'text')}
          className={[
            'px-1 py-3 mr-6 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'text' ? 'active-tab' : 'inactive-tab',
          ].join(' ')}
        >
          Текстовый режим
        </button>
        <button
          id="tab-url"
          type="button"
          role="tab"
          aria-selected={activeTab === 'url'}
          aria-controls="tabpanel"
          tabIndex={activeTab === 'url' ? 0 : -1}
          onClick={() => setActiveTab('url')}
          onKeyDown={(e) => handleKeyDown(e, 'url')}
          className={[
            'px-1 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'url' ? 'active-tab' : 'inactive-tab',
          ].join(' ')}
        >
          URL-режим
        </button>
      </div>

      <div
        role="tabpanel"
        id="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="pt-8 flex flex-col gap-8"
      >
        {activeTab === 'text' && (
          <>
            <TextModePanel onAnalysisComplete={setResults} />
            <ResultsSection passages={results} />
          </>
        )}
        {activeTab === 'url' && (
          <>
            <UrlModePanel onAnalysisComplete={handleAnalysisComplete} onReset={handleReset} />
            {analysisText !== null && (
              analysisText.length > 0
                ? <div className="flex flex-col gap-4">
                    <p className="text-sm" style={{ color: 'var(--text)' }}>
                      Текст получен — {analysisText.length.toLocaleString('ru-RU')} символов
                    </p>
                    <AnalysisPrompt
                      onAnalyze={query => void handleUrlAnalyze(query)}
                      loading={urlAnalysis.loading}
                      error={urlAnalysis.error}
                    />
                  </div>
                : <p className="text-sm" style={{ color: 'var(--text)' }}>
                    Страница не содержит читаемого текста. Попробуйте вставить содержимое вручную.
                  </p>
            )}
            <ResultsSection passages={urlResults} />
          </>
        )}
      </div>
    </div>
  )
}

export default App
