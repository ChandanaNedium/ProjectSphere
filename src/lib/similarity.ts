import { safeParseJson } from '@/lib/utils'

interface ProjectForSimilarity {
  id: string
  title: string
  abstract: string
  problemStatement: string
  domain: string
  subdomain?: string | null
  technologies: string
  skills: string
  tags: string
  methodology?: string | null
}

interface SimilarityBreakdown {
  problemScore: number
  techScore: number
  methodScore: number
  descScore: number
  domainScore: number
  overallScore: number
  explanation: string
  commonAreas: string[]
  differences: string[]
}

/**
 * Tokenize text into meaningful terms
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t))
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'has',
  'her', 'was', 'one', 'our', 'out', 'use', 'did', 'its', 'has', 'him',
  'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'who', 'boy',
  'did', 'get', 'may', 'way', 'she', 'use', 'via', 'with', 'this', 'that',
  'from', 'have', 'been', 'they', 'will', 'your', 'more', 'also', 'into',
  'used', 'each', 'both', 'over', 'such', 'than', 'then', 'them', 'very',
  'when', 'much', 'some', 'time', 'long', 'make', 'many', 'like', 'most',
  'after', 'being', 'their', 'these', 'which', 'while', 'about', 'using',
  'based', 'system', 'data', 'project', 'approach',
])

/**
 * Compute Jaccard similarity between two token sets
 */
function jaccard(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0
  const intersection = new Set([...setA].filter(x => setB.has(x)))
  const union = new Set([...setA, ...setB])
  return intersection.size / union.size
}

/**
 * Compute cosine-like similarity between two token lists using TF
 */
function textSimilarity(a: string, b: string): number {
  if (!a || !b) return 0
  const tokensA = tokenize(a)
  const tokensB = tokenize(b)
  if (tokensA.length === 0 || tokensB.length === 0) return 0
  return jaccard(new Set(tokensA), new Set(tokensB))
}

/**
 * Compute array overlap ratio (for technologies, skills)
 */
function arrayOverlap(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0
  const setA = new Set(a.map(x => x.toLowerCase()))
  const setB = new Set(b.map(x => x.toLowerCase()))
  return jaccard(setA, setB)
}

/**
 * Main similarity computation between two projects
 */
export function computeProjectSimilarity(
  projectA: ProjectForSimilarity,
  projectB: ProjectForSimilarity
): SimilarityBreakdown {
  // Domain match
  const domainScore = projectA.domain === projectB.domain ? 1.0 :
    (projectA.subdomain && projectA.subdomain === projectB.subdomain ? 0.7 : 0.1)

  // Problem statement similarity
  const problemScore = Math.min(
    1,
    textSimilarity(projectA.problemStatement, projectB.problemStatement) * 2.5
  )

  // Technology overlap
  const techA = safeParseJson<string[]>(projectA.technologies, [])
  const techB = safeParseJson<string[]>(projectB.technologies, [])
  const techScore = arrayOverlap(techA, techB)

  // Methodology similarity
  const methodScore = textSimilarity(
    projectA.methodology || '',
    projectB.methodology || ''
  )

  // Abstract/description similarity
  const descScore = textSimilarity(projectA.abstract, projectB.abstract)

  // Tags overlap (bonus signal)
  const tagsA = safeParseJson<string[]>(projectA.tags, [])
  const tagsB = safeParseJson<string[]>(projectB.tags, [])
  const tagScore = arrayOverlap(tagsA, tagsB)

  // Weighted composite score
  const overallScore = Math.min(1,
    domainScore * 0.20 +
    problemScore * 0.30 +
    techScore * 0.20 +
    descScore * 0.20 +
    tagScore * 0.10
  )

  // Find common areas
  const commonAreas: string[] = []
  if (projectA.domain === projectB.domain) commonAreas.push(`${projectA.domain} domain`)
  const commonTech = techA.filter(t => techB.some(t2 => t2.toLowerCase() === t.toLowerCase()))
  if (commonTech.length > 0) commonAreas.push(`Shared technologies: ${commonTech.slice(0, 3).join(', ')}`)
  const commonTags = tagsA.filter(t => tagsB.some(t2 => t2.toLowerCase() === t.toLowerCase()))
  if (commonTags.length > 0) commonAreas.push(`Related topics: ${commonTags.slice(0, 3).join(', ')}`)

  // Differences
  const differences: string[] = []
  const uniqueTechA = techA.filter(t => !techB.some(t2 => t2.toLowerCase() === t.toLowerCase()))
  const uniqueTechB = techB.filter(t => !techA.some(t2 => t2.toLowerCase() === t.toLowerCase()))
  if (uniqueTechA.length > 0) differences.push(`${projectA.title} uses: ${uniqueTechA.slice(0, 2).join(', ')}`)
  if (uniqueTechB.length > 0) differences.push(`${projectB.title} uses: ${uniqueTechB.slice(0, 2).join(', ')}`)

  // Generate explanation
  const explanation = generateExplanation(projectA, projectB, overallScore, commonAreas, domainScore, techScore)

  return {
    problemScore: Math.round(problemScore * 100) / 100,
    techScore: Math.round(techScore * 100) / 100,
    methodScore: Math.round(methodScore * 100) / 100,
    descScore: Math.round(descScore * 100) / 100,
    domainScore: Math.round(domainScore * 100) / 100,
    overallScore: Math.round(overallScore * 100) / 100,
    explanation,
    commonAreas,
    differences,
  }
}

function generateExplanation(
  a: ProjectForSimilarity,
  b: ProjectForSimilarity,
  score: number,
  commonAreas: string[],
  domainScore: number,
  techScore: number
): string {
  const scorePercent = Math.round(score * 100)

  if (score >= 0.8) {
    return `These projects show very high similarity (${scorePercent}%). Both address similar problem domains with overlapping technologies. ${commonAreas[0] || ''}. Careful review is recommended to ensure proper differentiation.`
  } else if (score >= 0.6) {
    return `These projects show moderate-high similarity (${scorePercent}%). They share ${domainScore >= 0.8 ? 'the same domain' : 'related topics'} and ${techScore > 0.3 ? 'several common technologies' : 'conceptual overlap'}. ${commonAreas[0] || ''}.`
  } else if (score >= 0.4) {
    return `These projects show moderate similarity (${scorePercent}%). They address related problems in ${a.domain} but differ in their approach and implementation. ${commonAreas[0] || ''}.`
  } else {
    return `These projects show low similarity (${scorePercent}%). While they may share a broad domain, their specific focus areas, methodologies, and technologies are substantially different.`
  }
}

/**
 * Find the most similar projects to a given project from a list of candidates
 */
export function findSimilarProjects(
  project: ProjectForSimilarity,
  candidates: ProjectForSimilarity[],
  limit = 5
): Array<{ project: ProjectForSimilarity; similarity: SimilarityBreakdown }> {
  return candidates
    .filter(c => c.id !== project.id)
    .map(candidate => ({
      project: candidate,
      similarity: computeProjectSimilarity(project, candidate),
    }))
    .sort((a, b) => b.similarity.overallScore - a.similarity.overallScore)
    .slice(0, limit)
}

/**
 * Semantic-like search scoring for a query against a project
 */
export function computeSearchRelevance(query: string, project: ProjectForSimilarity): number {
  const q = query.toLowerCase()
  const queryTokens = new Set(tokenize(q))

  const titleTokens = new Set(tokenize(project.title))
  const abstractTokens = new Set(tokenize(project.abstract))
  const techTokens = new Set(
    safeParseJson<string[]>(project.technologies, []).map(t => t.toLowerCase())
  )
  const tagTokens = new Set(
    safeParseJson<string[]>(project.tags, []).map(t => t.toLowerCase())
  )
  const domainTokens = new Set(tokenize(project.domain))

  // Exact phrase matching bonus
  const titleMatch = project.title.toLowerCase().includes(q) ? 0.5 : 0
  const abstractMatch = project.abstract.toLowerCase().includes(q) ? 0.3 : 0

  // Domain check
  const domainMatch = project.domain.toLowerCase().includes(q) ||
    [...queryTokens].some(qt => project.domain.toLowerCase().includes(qt)) ? 0.4 : 0

  // Token overlaps
  const titleScore = jaccard(queryTokens, titleTokens) * 2.0
  const abstractScore = jaccard(queryTokens, abstractTokens) * 1.5
  const techScore = jaccard(queryTokens, techTokens) * 1.8
  const tagScore = jaccard(queryTokens, tagTokens) * 1.5
  const domainScore = jaccard(queryTokens, domainTokens) * 1.2

  return Math.min(1,
    titleMatch + abstractMatch + domainMatch +
    titleScore + abstractScore + techScore + tagScore + domainScore
  )
}
