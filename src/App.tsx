import { useState } from 'react'
import './App.css'

type Tab = 'text' | 'url'

const TABS: Tab[] = ['text', 'url']

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('text')

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-medium text-center mb-8">
        Semantic Relevance Analyzer
      </h1>

      <div role="tablist" className="flex border-b" style={{ borderColor: 'var(--border)' }}>
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
            'px-6 py-3 text-sm font-medium transition-colors',
            activeTab === 'text'
              ? 'border-b-2 active-tab'
              : 'inactive-tab',
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
            'px-6 py-3 text-sm font-medium transition-colors',
            activeTab === 'url'
              ? 'border-b-2 active-tab'
              : 'inactive-tab',
          ].join(' ')}
        >
          URL-режим
        </button>
      </div>

      <div
        role="tabpanel"
        id="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="py-8"
      >
        {activeTab === 'text' && (
          <p>Текстовый режим — coming soon</p>
        )}
        {activeTab === 'url' && (
          <p>URL-режим — coming soon</p>
        )}
      </div>
    </div>
  )
}

export default App
