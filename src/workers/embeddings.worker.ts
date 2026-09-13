import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers'

let extractor: FeatureExtractionPipeline | null = null

async function loadModel(): Promise<FeatureExtractionPipeline> {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  }
  return extractor
}

export async function vectorize(text: string): Promise<number[]> {
  const model = await loadModel()
  const output = await model(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data as Float32Array)
}

self.addEventListener('message', async (event: MessageEvent<{ id: number; text: string }>) => {
  const { id, text } = event.data
  try {
    const vector = await vectorize(text)
    ;(self as unknown as { postMessage: (msg: unknown) => void }).postMessage({ id, vector })
  } catch (error) {
    ;(self as unknown as { postMessage: (msg: unknown) => void }).postMessage({ id, error: String(error) })
  }
})
