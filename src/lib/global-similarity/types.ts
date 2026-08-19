/**
 * Types and interfaces for the Global Project Similarity & Novelty Checker
 */

export type SourceType = 'ProjectSphere' | 'GitHub' | 'Web' | 'Research Paper'

export interface ProjectInput {
  title: string
  description: string
  domain: string
  technologies?: string[] | string
  methodology?: string
  problemStatement?: string
  expectedOutcome?: string
  targetUsers?: string
}

export interface StructuredProjectRepresentation {
  title: string
  problem: string
  domain: string
  technologies: string[]
  methodology: string
  expectedOutcome: string
  keyConcepts: string[]
  rawNormalizedText: string
}

export type QueryPerspective =
  | 'exact_concept'
  | 'problem_focused'
  | 'technology_focused'
  | 'methodology_focused'
  | 'alternative_terminology'
  | 'research_literature'

export interface GeneratedQuery {
  query: string
  perspective: QueryPerspective
  targetSources: SourceType[]
  rationale: string
}

export interface ExternalProjectResult {
  id: string
  title: string
  description: string
  source: SourceType
  sourceUrl: string
  domain?: string
  technologies?: string[]
  methodology?: string
  problemStatement?: string
  expectedOutcome?: string
  authors?: string[]
  date?: string
  institutionOrVenue?: string
  stars?: number
  doi?: string
  metadata?: Record<string, any>
  
  // Similarity Evaluation
  similarityScore: number // 0 to 100
  dimensionScores: SimilarityDimensionScores
  commonAreas: string[]
  differences: string[]
  explanation: string
}

export interface SimilarityDimensionScores {
  problemScore: number       // 0 to 100
  methodologyScore: number   // 0 to 100
  technologyScore: number    // 0 to 100
  domainScore: number        // 0 to 100
  outcomeScore: number       // 0 to 100
  overallWeightedScore: number // 0 to 100
}

export interface SourceStats {
  source: SourceType
  count: number
  highestScore: number
  averageScore: number
  status: 'active' | 'unavailable' | 'rate_limited' | 'empty'
  statusMessage?: string
}

export type SourceBreakdown = Record<SourceType, SourceStats>

export interface ResearchGapReport {
  overExploredAreas: {
    topic: string
    description: string
    frequency: 'Very High' | 'High' | 'Moderate'
  }[]
  emergingOpportunities: {
    topic: string
    description: string
    opportunityLevel: 'Very High' | 'High' | 'Moderate'
    domain: string
  }[]
  potentialResearchGaps: {
    gap: string
    context: string
    suggestedFocus: string
  }[]
}

export type NoveltyAssessment =
  | 'LOW OBSERVED SIMILARITY'
  | 'MODERATE OBSERVED SIMILARITY'
  | 'HIGH OBSERVED SIMILARITY'
  | 'STRONG SIMILARITY DETECTED'

export interface GlobalSimilarityReport {
  id: string
  createdAt: string
  project: StructuredProjectRepresentation
  
  // High-Level Summary
  overallAssessment: NoveltyAssessment
  highestMatchScore: number
  highestMatchSource: SourceType
  highestMatchProjectTitle: string
  averageSimilarity: number
  
  // Source Metrics
  sourcesAnalyzed: {
    projectSphere: number
    github: number
    web: number
    research: number
    total: number
  }
  sourceBreakdown: Record<SourceType, SourceStats>
  
  // Execution Details
  queriesExecuted: GeneratedQuery[]
  
  // Filtered & Ranked Candidates
  topMatches: ExternalProjectResult[]
  
  // Innovation & Gap Analysis
  researchGaps: ResearchGapReport
  differentiationSuggestions: string[]
  
  // Mandatory Disclaimer
  disclaimer: string
  
  // Embedding model used
  embeddingEngine: string
}

export interface GlobalCheckProgressStep {
  id: string
  label: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  message?: string
}
