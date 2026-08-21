import { ExternalProjectResult } from '../types'
import { tokenizeText } from '../embeddings/vector-math'

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.hostname.toLowerCase()}${parsed.pathname.replace(/\/+$/, '').toLowerCase()}`
  } catch {
    return url.trim().toLowerCase()
  }
}

function computeTitleTokenOverlap(a: string, b: string): number {
  const tokensA = new Set(tokenizeText(a))
  const tokensB = new Set(tokenizeText(b))
  if (tokensA.size === 0 || tokensB.size === 0) return 0

  const intersection = new Set([...tokensA].filter(x => tokensB.has(x)))
  const union = new Set([...tokensA, ...tokensB])
  return intersection.size / union.size
}

/**
 * Deduplicates external project results across multiple query hits and sources
 */
export function deduplicateCandidates(
  candidates: ExternalProjectResult[]
): ExternalProjectResult[] {
  const seenUrls = new Set<string>()
  const uniqueList: ExternalProjectResult[] = []

  for (const candidate of candidates) {
    if (!candidate.title || candidate.title.trim().length === 0) continue

    const normUrl = normalizeUrl(candidate.sourceUrl)
    if (seenUrls.has(normUrl)) continue

    // Check if title is nearly identical to an already accepted candidate (> 85% overlap)
    const isDuplicateTitle = uniqueList.some(existing => {
      const overlap = computeTitleTokenOverlap(existing.title, candidate.title)
      return overlap > 0.85
    })

    if (isDuplicateTitle) continue

    seenUrls.add(normUrl)
    uniqueList.push(candidate)
  }

  return uniqueList
}
