import { EmbeddingProvider } from './provider'
import { normalizeVector } from './vector-math'

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  name = 'Google Gemini (text-embedding-004)'
  dimension = 768
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5)
  }

  async embedText(text: string): Promise<number[]> {
    if (!this.apiKey) throw new Error('GEMINI_API_KEY is not configured')

    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${this.apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text: text.slice(0, 4000) }] },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Gemini Embedding API failed (${response.status}): ${err}`)
    }

    const data = await response.json()
    const values = data?.embedding?.values
    if (!values || !Array.isArray(values)) {
      throw new Error('Malformed embedding response from Gemini')
    }

    return normalizeVector(values)
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) throw new Error('GEMINI_API_KEY is not configured')

    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents?key=${this.apiKey}`
    const requests = texts.map(t => ({
      model: 'models/text-embedding-004',
      content: { parts: [{ text: t.slice(0, 4000) }] },
    }))

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    })

    if (!response.ok) {
      // Fall back to sequential
      return Promise.all(texts.map(t => this.embedText(t)))
    }

    const data = await response.json()
    const embeddings = data?.embeddings
    if (!embeddings || !Array.isArray(embeddings)) {
      return Promise.all(texts.map(t => this.embedText(t)))
    }

    return embeddings.map((e: any) => normalizeVector(e.values || []))
  }
}
