import {
  ExternalProjectResult,
  GeneratedQuery,
  StructuredProjectRepresentation,
} from '../types'
import { getEnvConfig, GLOBAL_SIMILARITY_CONFIG } from '../config'

export async function searchGitHub(
  project: StructuredProjectRepresentation,
  queries: GeneratedQuery[]
): Promise<{ results: ExternalProjectResult[]; error?: string; rateLimited?: boolean }> {
  const env = getEnvConfig()
  const resultsMap = new Map<string, ExternalProjectResult>()
  let isRateLimited = false
  let lastError: string | undefined

  const relevantQueries = queries.filter(q => q.targetSources.includes('GitHub'))
  if (relevantQueries.length === 0) {
    relevantQueries.push({
      query: project.title,
      perspective: 'exact_concept',
      targetSources: ['GitHub'],
      rationale: 'Default exact search',
    })
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'ProjectSphere-Global-Similarity-Engine/1.0',
  }

  if (env.githubToken) {
    headers.Authorization = `token ${env.githubToken}`
  }

  for (const q of relevantQueries.slice(0, 2)) {
    try {
      const cleanQ = encodeURIComponent(q.query.slice(0, 80))
      const url = `https://api.github.com/search/repositories?q=${cleanQ}&sort=stars&order=desc&per_page=6`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), GLOBAL_SIMILARITY_CONFIG.API_TIMEOUT_MS)

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (response.status === 403 || response.status === 429) {
        isRateLimited = true
        lastError = 'GitHub API rate limit reached. Using available public repo metadata.'
        break
      }

      if (!response.ok) {
        lastError = `GitHub API returned status ${response.status}`
        continue
      }

      const data = await response.json()
      const items = data?.items || []

      for (const item of items) {
        if (!item.html_url || resultsMap.has(item.html_url)) continue

        const topics = Array.isArray(item.topics) ? item.topics : []
        const tech = [item.language, ...topics].filter(Boolean) as string[]

        resultsMap.set(item.html_url, {
          id: `github-${item.id}`,
          title: item.name.replace(/[-_]/g, ' '),
          description: item.description || `Public repository by ${item.owner?.login} with ${item.stargazers_count} stars.`,
          source: 'GitHub',
          sourceUrl: item.html_url,
          domain: project.domain,
          technologies: tech,
          authors: [item.owner?.login || 'GitHub Developer'],
          stars: item.stargazers_count,
          date: item.updated_at ? item.updated_at.slice(0, 4) : undefined,
          institutionOrVenue: `GitHub (${item.full_name})`,
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
      if (err.name === 'AbortError') {
        lastError = 'GitHub request timed out'
      } else {
        lastError = err?.message || 'Failed to connect to GitHub API'
      }
    }
  }

  const results = Array.from(resultsMap.values()).slice(0, GLOBAL_SIMILARITY_CONFIG.MAX_GITHUB_RESULTS)
  return {
    results,
    error: results.length === 0 ? lastError : undefined,
    rateLimited: isRateLimited,
  }
}
