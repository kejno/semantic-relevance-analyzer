export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dot = 0
  let magA = 0
  let magB = 0
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i]
    magA += vecA[i] * vecA[i]
    magB += vecB[i] * vecB[i]
  }
  const magnitude = Math.sqrt(magA) * Math.sqrt(magB)
  if (magnitude === 0) return 0
  return dot / magnitude
}
