import { ExternalProjectResult, StructuredProjectRepresentation } from '../types'
import { cosineSimilarity, generateLocalVector } from '../embeddings/vector-math'
import { GLOBAL_SIMILARITY_CONFIG } from '../config'

/**
 * Filter out weak or irrelevant matches before computing deep multi-dimensional embeddings
 */
export function filterRelevantCandidates(
  project: StructuredProjectRepresentation,
  candidates: ExternalProjectResult[]
): ExternalProjectResult[] {
  const queryVector = generateLocalVector(
    `${project.title} ${project.domain} ${project.problem} ${project.technologies.join(' ')}`
  )

  const scored = candidates.map(candidate => {
    const candidateText = `${candidate.title} ${candidate.description} ${(candidate.technologies || []).join(' ')}`
    const candidateVector = generateLocalVector(candidateText)
    const rawRelevance = cosineSimilarity(queryVector, candidateVector) * 100

    return {
      candidate,
      relevance: Math.round(rawRelevance * 10) / 10,
    }
  })

  // Discard anything below threshold unless candidate list is very small
  const filtered = scored
    .filter(item => item.relevance >= GLOBAL_SIMILARITY_CONFIG.MIN_RELEVANCE_SCORE)
    .sort((a, b) => b.relevance - a.relevance)
    .map(item => item.candidate)

  if (filtered.length >= 3) {
    return filtered.slice(0, GLOBAL_SIMILARITY_CONFIG.MAX_TOTAL_CANDIDATES)
  }

  // If strict threshold removed too many, return top scored items
  return scored
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, Math.min(candidates.length, 6))
    .map(item => item.candidate)
}
