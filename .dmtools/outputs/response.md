### What changed

Added in-browser ML infrastructure for text vectorization and semantic similarity: `@xenova/transformers` dependency, a Web Worker for off-thread model loading/inference, `cosineSimilarity` and `segmentText` utilities, and a Vitest test suite with 16 passing tests.

### Key decisions

- Web Worker (`src/workers/embeddings.worker.ts`) isolates 2–5 s model loading from the UI thread; worker exposes a message-based API so callers pass `{id, text}` and receive `{id, vector}` or `{id, error}`
- `segmentText` buffers short paragraphs (<20 words) and merges them into the adjacent long one; trailing orphan short segments are appended to the last passage
- `cosineSimilarity` returns 0 for zero-magnitude vectors to avoid division-by-zero
- Model: `Xenova/all-MiniLM-L6-v2` — ~23 MB, CDN-cached by the browser after first load

### How to verify

```bash
npm test -- --run
```

All 16 unit tests pass (2 test files: `similarity.test.ts`, `segmentation.test.ts`).
