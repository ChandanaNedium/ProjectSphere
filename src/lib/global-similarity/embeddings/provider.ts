/**
 * Embedding Provider Abstraction
 */

export interface EmbeddingProvider {
  name: string
  dimension: number
  embedText(text: string): Promise<number[]>
  embedBatch(texts: string[]): Promise<number[][]>
  isAvailable(): Promise<boolean>
}
