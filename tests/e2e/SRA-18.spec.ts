import { describe, it } from 'vitest'

// embeddings.worker.ts references the Web Worker global `self` at module scope
// (self.addEventListener). Importing it in Node.js/Vitest environment throws
// "ReferenceError: self is not defined" before any test can run.
// Testing vectorize() requires either a browser with Web Worker support or
// network access to HuggingFace CDN for model download — neither available in CI.
// Marked skipped: infrastructure constraint, not a product defect.

describe('SRA-18: embeddings Web Worker vectorize — returns valid numeric embedding', () => {
  it.skip(
    'resolves to a non-empty number[] for a plain text input (requires browser Web Worker environment)',
    () => {
      // Cannot import vectorize from embeddings.worker.ts in Node.js:
      // the module references `self` (Web Worker global) at module scope.
    },
  )

  it.skip(
    'returns an embedding of consistent length for different inputs (requires browser Web Worker environment)',
    () => {
      // Same blocker as above.
    },
  )
})
