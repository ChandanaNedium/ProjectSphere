/**
 * Centralized Configuration for Global Project Similarity & Novelty Checker
 */

export const SIMILARITY_WEIGHTS = {
  PROBLEM: 0.35,      // 35% Problem similarity
  METHODOLOGY: 0.25,  // 25% Methodology / architectural approach
  TECHNOLOGY: 0.20,   // 20% Technology stack & frameworks
  DOMAIN: 0.10,       // 10% Domain & subdomain alignment
  OUTCOME: 0.10,      // 10% Target outcome & scope
} as const

export const GLOBAL_SIMILARITY_CONFIG = {
  // Candidate retrieval limits per source
  MAX_PROJECTSPHERE_RESULTS: 12,
  MAX_GITHUB_RESULTS: 12,
  MAX_WEB_RESULTS: 12,
  MAX_RESEARCH_RESULTS: 12,
  
  // Total candidate evaluation cap
  MAX_TOTAL_CANDIDATES: 40,
  
  // Maximum search queries generated per source
  MAX_QUERIES_PER_SOURCE: 4,
  
  // Filtering thresholds
  MIN_RELEVANCE_SCORE: 15,          // Discard candidates with < 15% relevance
  HIGH_SIMILARITY_THRESHOLD: 70,    // Highlight candidates with >= 70% match
  STRONG_SIMILARITY_THRESHOLD: 80,  // Severe overlap threshold
  
  // Disclaimer required by user specifications
  DISCLAIMER:
    'Similarity results are based on publicly accessible sources and should be treated as an indication for further review, not as proof of originality or plagiarism.',
  
  // Timeout per external API call in ms
  API_TIMEOUT_MS: 9000,
}

export function getEnvConfig() {
  return {
    githubToken: process.env.GITHUB_TOKEN || '',
    embeddingProvider: (process.env.EMBEDDING_PROVIDER || 'local').toLowerCase() as 'local' | 'gemini' | 'openai',
    geminiApiKey: process.env.GEMINI_API_KEY || process.env.EMBEDDING_API_KEY || '',
    openAiApiKey: process.env.OPENAI_API_KEY || '',
    webSearchProvider: (process.env.WEB_SEARCH_PROVIDER || 'open_web').toLowerCase() as
      | 'tavily'
      | 'serpapi'
      | 'bing'
      | 'google_custom'
      | 'open_web'
      | 'mock',
    tavilyApiKey: process.env.TAVILY_API_KEY || '',
    serpApiKey: process.env.SERPAPI_API_KEY || '',
    bingApiKey: process.env.BING_API_KEY || '',
    googleSearchApiKey: process.env.GOOGLE_SEARCH_API_KEY || '',
    googleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID || '',
    openAlexEmail: process.env.OPENALEX_EMAIL || 'admin@projectsphere.dev',
    semanticScholarApiKey: process.env.SEMANTIC_SCHOLAR_API_KEY || '',
  }
}
