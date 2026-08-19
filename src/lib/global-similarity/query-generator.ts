import {
  ProjectInput,
  StructuredProjectRepresentation,
  GeneratedQuery,
} from './types'
import { tokenizeText } from './embeddings/vector-math'
import { GLOBAL_SIMILARITY_CONFIG } from './config'

/**
 * Normalizes input project data into a structured representation
 */
export function buildStructuredRepresentation(
  input: ProjectInput
): StructuredProjectRepresentation {
  const title = input.title.trim()
  const domain = input.domain.trim()
  
  // Parse tech
  let technologies: string[] = []
  if (Array.isArray(input.technologies)) {
    technologies = input.technologies.filter(Boolean)
  } else if (typeof input.technologies === 'string') {
    technologies = input.technologies
      .split(/[,;|]+/)
      .map(t => t.trim())
      .filter(Boolean)
  }

  const problem = input.problemStatement?.trim() || extractProblem(input.description)
  const methodology = input.methodology?.trim() || extractMethodology(input.description, technologies)
  const expectedOutcome = input.expectedOutcome?.trim() || extractOutcome(input.description)
  const keyConcepts = extractKeyConcepts(title, input.description, domain, technologies)

  const rawNormalizedText = [
    `TITLE: ${title}`,
    `DOMAIN: ${domain}`,
    `PROBLEM: ${problem}`,
    `TECHNOLOGIES: ${technologies.join(', ')}`,
    `METHODOLOGY: ${methodology}`,
    `EXPECTED OUTCOME: ${expectedOutcome}`,
    `KEY CONCEPTS: ${keyConcepts.join(', ')}`,
  ].join('\n')

  return {
    title,
    problem,
    domain,
    technologies,
    methodology,
    expectedOutcome,
    keyConcepts,
    rawNormalizedText,
  }
}

function extractProblem(desc: string): string {
  if (!desc) return ''
  const sentences = desc.split(/[.!?]+/).map(s => s.trim()).filter(Boolean)
  const problemSentences = sentences.filter(s =>
    /problem|challenge|issue|lack|difficult|waste|cost|inefficient|delay|cheat|manual|threat|loss/i.test(s)
  )
  if (problemSentences.length > 0) return problemSentences.slice(0, 2).join('. ') + '.'
  return sentences.slice(0, 2).join('. ') + '.'
}

function extractMethodology(desc: string, tech: string[]): string {
  if (!desc) return tech.join(', ')
  const sentences = desc.split(/[.!?]+/).map(s => s.trim()).filter(Boolean)
  const methodSentences = sentences.filter(s =>
    /using|trained|model|algorithm|architecture|dataset|pipeline|network|protocol|system|framework|process/i.test(s)
  )
  if (methodSentences.length > 0) return methodSentences.slice(0, 2).join('. ') + '.'
  return tech.length > 0 ? `Built using ${tech.join(', ')}.` : desc.slice(0, 150)
}

function extractOutcome(desc: string): string {
  if (!desc) return ''
  const sentences = desc.split(/[.!?]+/).map(s => s.trim()).filter(Boolean)
  const outcomeSentences = sentences.filter(s =>
    /achieve|reduce|improve|result|enable|provide|predict|detect|classify|deliver|optimize/i.test(s)
  )
  if (outcomeSentences.length > 0) return outcomeSentences.slice(0, 2).join('. ') + '.'
  return sentences[sentences.length - 1] || ''
}

function extractKeyConcepts(
  title: string,
  desc: string,
  domain: string,
  tech: string[]
): string[] {
  const concepts = new Set<string>()

  // Title phrases
  const titleTokens = tokenizeText(title)
  for (const t of titleTokens) {
    if (t.length > 3) concepts.add(t)
  }

  // Domain
  concepts.add(domain.toLowerCase())

  // Technologies
  for (const t of tech) {
    concepts.add(t.toLowerCase())
  }

  // Significant descriptive tokens
  const descTokens = tokenizeText(desc)
  for (const t of descTokens) {
    if (concepts.size >= 10) break
    if (t.length > 4) concepts.add(t)
  }

  return Array.from(concepts).slice(0, 8)
}

/**
 * Generates multi-perspective targeted queries to search external sources
 */
export function generateSearchQueries(
  project: StructuredProjectRepresentation
): GeneratedQuery[] {
  const queries: GeneratedQuery[] = []
  const topTech = project.technologies.slice(0, 3).join(' ')
  const cleanTitle = project.title.replace(/[:\-–—()]/g, ' ').replace(/\s+/g, ' ').trim()

  // 1. Exact Concept Query
  queries.push({
    query: `${cleanTitle}`,
    perspective: 'exact_concept',
    targetSources: ['ProjectSphere', 'GitHub', 'Web', 'Research Paper'],
    rationale: 'Searches for direct conceptual and name matches across all repositories and literature.',
  })

  // 2. Problem + Domain Focused Query
  const problemKeywords = tokenizeText(project.problem).slice(0, 3).join(' ')
  const problemQuery = problemKeywords
    ? `${project.domain} ${problemKeywords}`
    : `${project.domain} ${cleanTitle}`
  queries.push({
    query: problemQuery.trim(),
    perspective: 'problem_focused',
    targetSources: ['ProjectSphere', 'Web', 'Research Paper'],
    rationale: 'Identifies solutions addressing the same fundamental problem space.',
  })

  // 3. Technology + Architecture Focused Query
  if (topTech) {
    const techQuery = `${cleanTitle} ${topTech}`.slice(0, 80)
    queries.push({
      query: techQuery.trim(),
      perspective: 'technology_focused',
      targetSources: ['GitHub', 'Web'],
      rationale: 'Finds open-source projects and codebases built with identical tech stacks.',
    })
  }

  // 4. Academic Research / Methodology Query
  const methodKeywords = tokenizeText(project.methodology).slice(0, 3).join(' ')
  const academicQuery = `${project.domain} ${cleanTitle} ${methodKeywords}`.slice(0, 90)
  queries.push({
    query: academicQuery.trim(),
    perspective: 'research_literature',
    targetSources: ['Research Paper', 'Web'],
    rationale: 'Finds peer-reviewed publications and conference papers with similar methodologies.',
  })

  return queries.slice(0, GLOBAL_SIMILARITY_CONFIG.MAX_QUERIES_PER_SOURCE)
}
