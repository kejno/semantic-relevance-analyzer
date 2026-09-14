import { useState } from 'react'
import './App.css'

type Tab = 'text' | 'url'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('text')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-medium text-center mb-8" style={{ color: 'var(--text-h)' }}>
        Semantic Relevance Analyzer
      </h1>

      <div role="tablist" className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        <button
          role="tab"
          aria-selected={activeTab === 'text'}
          onClick={() => setActiveTab('text')}
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
          role="tab"
          aria-selected={activeTab === 'url'}
          onClick={() => setActiveTab('url')}
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

      <div role="tabpanel" className="py-8">
        {activeTab === 'text' && (
          <p style={{ color: 'var(--text)' }}>Текстовый режим — coming soon</p>
        )}
        {activeTab === 'url' && (
          <p style={{ color: 'var(--text)' }}>URL-режим — coming soon</p>
        )}
      </div>
    </div>
  )
}

export default App
