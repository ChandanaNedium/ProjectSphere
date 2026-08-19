import {
  ExternalProjectResult,
  GeneratedQuery,
  StructuredProjectRepresentation,
} from '../types'
import { getEnvConfig, GLOBAL_SIMILARITY_CONFIG } from '../config'

/**
 * Reconstructs standard abstract text from OpenAlex inverted index format
 */
function reconstructOpenAlexAbstract(invertedIndex: Record<string, number[]> | undefined): string {
  if (!invertedIndex) return ''
  const wordsWithPos: Array<{ word: string; pos: number }> = []

  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      wordsWithPos.push({ word, pos })
    }
  }

  wordsWithPos.sort((a, b) => a.pos - b.pos)
  return wordsWithPos.map(item => item.word).join(' ').slice(0, 800)
}

export async function searchResearchLiterature(
  project: StructuredProjectRepresentation,
  queries: GeneratedQuery[]
): Promise<{ results: ExternalProjectResult[]; error?: string }> {
  const env = getEnvConfig()
  const resultsMap = new Map<string, ExternalProjectResult>()
  let lastError: string | undefined

  const relevantQueries = queries.filter(q => q.targetSources.includes('Research Paper'))
  if (relevantQueries.length === 0) {
    relevantQueries.push({
      query: `${project.domain} ${project.title}`,
      perspective: 'research_literature',
      targetSources: ['Research Paper'],
      rationale: 'Default academic search',
    })
  }

  for (const q of relevantQueries.slice(0, 2)) {
    try {
      // 1. Query OpenAlex API (Open Access Academic Metadata)
      const emailParam = env.openAlexEmail ? `&mailto=${encodeURIComponent(env.openAlexEmail)}` : ''
      const cleanSearch = encodeURIComponent(q.query.slice(0, 80))
      const openAlexUrl = `https://api.openalex.org/works?search=${cleanSearch}&per-page=6&sort=relevance_score:desc${emailParam}`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), GLOBAL_SIMILARITY_CONFIG.API_TIMEOUT_MS)

      const response = await fetch(openAlexUrl, {
        headers: { 'User-Agent': 'ProjectSphere-Academic-Discovery/1.0' },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const works = data?.results || []

        for (const work of works) {
          const title = work.display_name || work.title
          if (!title) continue

          const doi = work.doi || ''
          const url = doi || work.id || (work.primary_location?.landing_page_url) || `https://openalex.org/${work.id}`
          if (resultsMap.has(url)) continue

          const abstract = reconstructOpenAlexAbstract(work.abstract_inverted_index) ||
            `Academic publication by ${work.authorships?.[0]?.author?.display_name || 'researchers'} published in ${work.primary_location?.source?.display_name || 'Peer-Reviewed Literature'}.`

          const authors = (work.authorships || [])
            .map((a: any) => a.author?.display_name)
            .filter(Boolean)
            .slice(0, 3)

          const venue = work.primary_location?.source?.display_name || 'Academic Conference / Journal'
          const concepts = (work.concepts || []).map((c: any) => c.display_name).slice(0, 4)

          resultsMap.set(url, {
            id: `alex-${work.id?.replace('https://openalex.org/', '') || Math.random().toString(36).slice(2, 9)}`,
            title,
            description: abstract,
            source: 'Research Paper',
            sourceUrl: url,
            domain: project.domain,
            technologies: concepts,
            authors: authors.length > 0 ? authors : ['Academic Researchers'],
            institutionOrVenue: venue,
            date: work.publication_year ? String(work.publication_year) : undefined,
            doi: doi || undefined,
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
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        lastError = 'OpenAlex academic request timed out'
      } else {
        lastError = err?.message || 'Academic search endpoint unavailable'
      }
    }

    // 2. Semantic Scholar fallback if OpenAlex yielded fewer results
    if (resultsMap.size < 3) {
      try {
        const s2Url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(q.query)}&limit=5&fields=title,abstract,authors,year,venue,externalIds`
        const s2Res = await fetch(s2Url, {
          headers: env.semanticScholarApiKey ? { 'x-api-key': env.semanticScholarApiKey } : {},
        }).catch(() => null)

        if (s2Res && s2Res.ok) {
          const s2Data = await s2Res.json()
          for (const paper of s2Data?.data || []) {
            if (!paper.title) continue
            const paperUrl = paper.externalIds?.DOI ? `https://doi.org/${paper.externalIds.DOI}` : `https://www.semanticscholar.org/paper/${paper.paperId}`
            if (resultsMap.has(paperUrl)) continue

            resultsMap.set(paperUrl, {
              id: `s2-${paper.paperId?.slice(0, 16) || Math.random().toString(36).slice(2, 9)}`,
              title: paper.title,
              description: paper.abstract || `Research paper in ${paper.venue || project.domain}.`,
              source: 'Research Paper',
              sourceUrl: paperUrl,
              domain: project.domain,
              authors: (paper.authors || []).map((a: any) => a.name).slice(0, 3),
              institutionOrVenue: paper.venue || 'Academic Journal',
              date: paper.year ? String(paper.year) : undefined,
              doi: paper.externalIds?.DOI,
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
        }
      } catch {
        // Fallback silently
      }
    }
  }

  const results = Array.from(resultsMap.values()).slice(0, GLOBAL_SIMILARITY_CONFIG.MAX_RESEARCH_RESULTS)
  return {
    results,
    error: results.length === 0 ? lastError : undefined,
  }
}
