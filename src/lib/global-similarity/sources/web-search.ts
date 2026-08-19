import {
  ExternalProjectResult,
  GeneratedQuery,
  StructuredProjectRepresentation,
} from '../types'
import { getEnvConfig, GLOBAL_SIMILARITY_CONFIG } from '../config'

export interface WebSearchProvider {
  name: string
  search(query: string, limit: number): Promise<Array<{ title: string; url: string; snippet: string; domain?: string }>>
}

/**
 * Tavily AI Search API Provider
 */
export class TavilySearchProvider implements WebSearchProvider {
  name = 'Tavily Search API'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async search(query: string, limit: number) {
    if (!this.apiKey) return []
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: this.apiKey,
        query,
        search_depth: 'basic',
        max_results: limit,
      }),
    })
    if (!response.ok) return []
    const data = await response.json()
    return (data?.results || []).map((r: any) => ({
      title: r.title || 'Web Result',
      url: r.url,
      snippet: r.content || r.snippet || '',
      domain: new URL(r.url).hostname.replace(/^www\./, ''),
    }))
  }
}

/**
 * SerpAPI Google Search Provider
 */
export class SerpApiSearchProvider implements WebSearchProvider {
  name = 'SerpAPI (Google Search)'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async search(query: string, limit: number) {
    if (!this.apiKey) return []
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&num=${limit}&api_key=${this.apiKey}`
    const response = await fetch(url)
    if (!response.ok) return []
    const data = await response.json()
    return (data?.organic_results || []).map((r: any) => ({
      title: r.title || 'Web Result',
      url: r.link,
      snippet: r.snippet || '',
      domain: r.displayed_link || 'Google Search',
    }))
  }
}

/**
 * Bing Web Search Provider
 */
export class BingSearchProvider implements WebSearchProvider {
  name = 'Bing Web Search API'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async search(query: string, limit: number) {
    if (!this.apiKey) return []
    const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=${limit}`
    const response = await fetch(url, {
      headers: { 'Ocp-Apim-Subscription-Key': this.apiKey },
    })
    if (!response.ok) return []
    const data = await response.json()
    return (data?.webPages?.value || []).map((r: any) => ({
      title: r.name || 'Web Result',
      url: r.url,
      snippet: r.snippet || '',
      domain: r.displayUrl || 'Bing',
    }))
  }
}

/**
 * Google Custom Search JSON API
 */
export class GoogleCustomSearchProvider implements WebSearchProvider {
  name = 'Google Custom Search API'
  private apiKey: string
  private cx: string

  constructor(apiKey: string, cx: string) {
    this.apiKey = apiKey
    this.cx = cx
  }

  async search(query: string, limit: number) {
    if (!this.apiKey || !this.cx) return []
    const url = `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${this.cx}&q=${encodeURIComponent(query)}&num=${Math.min(limit, 10)}`
    const response = await fetch(url)
    if (!response.ok) return []
    const data = await response.json()
    return (data?.items || []).map((r: any) => ({
      title: r.title || 'Web Result',
      url: r.link,
      snippet: r.snippet || '',
      domain: r.displayLink || 'Google',
    }))
  }
}

/**
 * Public Open Web Provider (DuckDuckGo Instant Answers & Wikipedia API)
 */
export class OpenWebSearchProvider implements WebSearchProvider {
  name = 'Open Web Search (Public Endpoints)'

  async search(query: string, limit: number) {
    const results: Array<{ title: string; url: string; snippet: string; domain?: string }> = []
    
    try {
      // 1. DuckDuckGo Instant Answers JSON API
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 4000)
      
      const ddgRes = await fetch(ddgUrl, {
        headers: { 'User-Agent': 'ProjectSphere-Similarity-Bot/1.0' },
        signal: controller.signal,
      }).catch(() => null)
      clearTimeout(timeout)

      if (ddgRes && ddgRes.ok) {
        const data = await ddgRes.json()
        if (data.AbstractText && data.AbstractURL) {
          results.push({
            title: data.Heading || query,
            url: data.AbstractURL,
            snippet: data.AbstractText,
            domain: data.AbstractSource || 'DuckDuckGo Knowledge',
          })
        }
        if (Array.isArray(data.RelatedTopics)) {
          for (const topic of data.RelatedTopics.slice(0, 4)) {
            if (topic.Text && topic.FirstURL) {
              results.push({
                title: topic.Text.split(' - ')[0] || query,
                url: topic.FirstURL,
                snippet: topic.Text,
                domain: 'Web Index',
              })
            }
          }
        }
      }
    } catch {
      // Ignore open web individual call issues
    }

    try {
      // 2. Wikipedia Search API for domain context & concept verification
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=${limit}&namespace=0&format=json`
      const wikiRes = await fetch(wikiUrl, {
        headers: { 'User-Agent': 'ProjectSphere-Similarity-Bot/1.0' },
      }).catch(() => null)

      if (wikiRes && wikiRes.ok) {
        const [searchTerm, titles, descriptions, urls] = await wikiRes.json()
        if (Array.isArray(titles)) {
          for (let i = 0; i < titles.length; i++) {
            if (titles[i] && urls[i] && descriptions[i]) {
              results.push({
                title: titles[i],
                url: urls[i],
                snippet: descriptions[i],
                domain: 'wikipedia.org',
              })
            }
          }
        }
      }
    } catch {
      // Ignore
    }

    return results.slice(0, limit)
  }
}

/**
 * Factory for WebSearchProvider
 */
export function getWebSearchProvider(): WebSearchProvider {
  const env = getEnvConfig()

  if (env.webSearchProvider === 'tavily' && env.tavilyApiKey) {
    return new TavilySearchProvider(env.tavilyApiKey)
  }
  if (env.webSearchProvider === 'serpapi' && env.serpApiKey) {
    return new SerpApiSearchProvider(env.serpApiKey)
  }
  if (env.webSearchProvider === 'bing' && env.bingApiKey) {
    return new BingSearchProvider(env.bingApiKey)
  }
  if (env.webSearchProvider === 'google_custom' && env.googleSearchApiKey && env.googleSearchEngineId) {
    return new GoogleCustomSearchProvider(env.googleSearchApiKey, env.googleSearchEngineId)
  }
  if (env.tavilyApiKey) {
    return new TavilySearchProvider(env.tavilyApiKey)
  }
  if (env.serpApiKey) {
    return new SerpApiSearchProvider(env.serpApiKey)
  }

  return new OpenWebSearchProvider()
}

export async function searchWeb(
  project: StructuredProjectRepresentation,
  queries: GeneratedQuery[]
): Promise<{ results: ExternalProjectResult[]; providerName: string; error?: string }> {
  const provider = getWebSearchProvider()
  const resultsMap = new Map<string, ExternalProjectResult>()
  let lastError: string | undefined

  const relevantQueries = queries.filter(q => q.targetSources.includes('Web'))
  if (relevantQueries.length === 0) {
    relevantQueries.push({
      query: project.title,
      perspective: 'exact_concept',
      targetSources: ['Web'],
      rationale: 'Default web search',
    })
  }

  for (const q of relevantQueries.slice(0, 3)) {
    try {
      const items = await provider.search(q.query, 5)
      for (const item of items) {
        if (!item.url || resultsMap.has(item.url)) continue

        resultsMap.set(item.url, {
          id: `web-${encodeURIComponent(item.url).slice(0, 32)}`,
          title: item.title,
          description: item.snippet || `Web documentation and publication regarding ${item.title}.`,
          source: 'Web',
          sourceUrl: item.url,
          domain: project.domain,
          institutionOrVenue: item.domain || 'Public Web Resource',
          date: new Date().getFullYear().toString(),
          similarityScore: 0,
          dimensionScores: {
            problemScore: 0,
            methodologyScore: 0,
            technologyScore: 0,
            domainScore: 0,
            outcomeScore: 0,
            overallWeightedScore: 0,
          },
          commonAreas: [],
          differences: [],
          explanation: '',
        })
      }
    } catch (err: any) {
      lastError = err?.message || 'Web search query failed'
    }
  }

  const results = Array.from(resultsMap.values()).slice(0, GLOBAL_SIMILARITY_CONFIG.MAX_WEB_RESULTS)
  return {
    results,
    providerName: provider.name,
    error: results.length === 0 ? lastError : undefined,
  }
}
