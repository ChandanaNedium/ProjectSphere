import { EmbeddingProvider } from './provider'
import { LocalVectorProvider } from './local-vector-provider'
import { GeminiEmbeddingProvider } from './gemini-provider'
import { OpenAIEmbeddingProvider } from './openai-provider'
import { getEnvConfig } from '../config'

export * from './provider'
export * from './vector-math'
export * from './local-vector-provider'
export * from './gemini-provider'
export * from './openai-provider'

export async function getEmbeddingProvider(): Promise<EmbeddingProvider> {
  const env = getEnvConfig()

  if (env.embeddingProvider === 'gemini' && env.geminiApiKey) {
    const gemini = new GeminiEmbeddingProvider(env.geminiApiKey)
    if (await gemini.isAvailable()) {
      return gemini
    }
  }

  if (env.embeddingProvider === 'openai' && env.openAiApiKey) {
    const openai = new OpenAIEmbeddingProvider(env.openAiApiKey)
    if (await openai.isAvailable()) {
      return openai
    }
  }

  // If gemini key exists regardless of setting, try it
  if (env.geminiApiKey) {
    const gemini = new GeminiEmbeddingProvider(env.geminiApiKey)
    if (await gemini.isAvailable()) {
      return gemini
    }
  }

  // Default: robust local deterministic mathematical vector provider
  return new LocalVectorProvider()
}
