import { EmbeddingProvider } from './provider'
import { normalizeVector } from './vector-math'

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  name = 'OpenAI (text-embedding-3-small)'
  dimension = 1536
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5)
  }

  async embedText(text: string): Promise<number[]> {
    const results = await this.embedBatch([text])
    return results[0]
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) throw new Error('OPENAI_API_KEY is not configured')

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: texts.map(t => t.slice(0, 4000)),
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenAI Embedding API failed (${response.status}): ${err}`)
    }

    const data = await response.json()
    const dataList = data?.data
    if (!dataList || !Array.isArray(dataList)) {
      throw new Error('Malformed embedding response from OpenAI')
    }

    return dataList.map((item: any) => normalizeVector(item.embedding || []))
  }
}
