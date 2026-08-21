import { EmbeddingProvider } from './provider'
import { generateLocalVector } from './vector-math'

export class LocalVectorProvider implements EmbeddingProvider {
  name = 'ProjectSphere Mathematical Vector Engine (TF-IDF + Subword N-Gram)'
  dimension = 384

  async embedText(text: string): Promise<number[]> {
    return generateLocalVector(text, this.dimension)
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return texts.map(t => generateLocalVector(t, this.dimension))
  }

  async isAvailable(): Promise<boolean> {
    return true
  }
}
