import {
  ExternalProjectResult,
  GlobalSimilarityReport,
  NoveltyAssessment,
  ProjectInput,
  SourceBreakdown,
  SourceStats,
  SourceType,
} from "./types";
import {
  buildStructuredRepresentation,
  generateSearchQueries,
} from "./query-generator";
import { searchProjectSphere } from "./sources/project-sphere";
import { searchGitHub } from "./sources/github";
import { searchWeb } from "./sources/web-search";
import { searchResearchLiterature } from "./sources/research";
import { deduplicateCandidates } from "./pipeline/deduplication";
import { filterRelevantCandidates } from "./pipeline/relevance-filter";
import { compareProjectWithCandidate } from "./pipeline/comparator";
import { synthesizeResearchGaps } from "./pipeline/gap-analyzer";
import { generateDifferentiationSuggestions } from "./pipeline/suggestion-engine";
import { getEmbeddingProvider } from "./embeddings";
import { GLOBAL_SIMILARITY_CONFIG } from "./config";
import { analyzeGitHubRepository } from "@/lib/github-repository-analyzer";

/**
 * Executes the complete end-to-end Global Similarity & Novelty Discovery Pipeline
 */
export async function runGlobalSimilarityCheck(
  input: ProjectInput,
): Promise<GlobalSimilarityReport> {
  const reportId = `report-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // 1. Structured Project Representation
  const repositoryAnalysis = input.githubRepoUrl
    ? await analyzeGitHubRepository(input.githubRepoUrl)
    : { ok: false as const };
  const project = buildStructuredRepresentation({
    ...input,
    repositoryProfile: repositoryAnalysis.profile,
  });

  // 2. Query Generation
  const queries = generateSearchQueries(project);

  // 3. Parallel Multi-Source Discovery with fault-tolerance
  const [projectSphereResult, githubResult, webResult, researchResult] =
    await Promise.all([
      searchProjectSphere(project, queries).catch((err) => ({
        results: [] as ExternalProjectResult[],
        error: err?.message || "ProjectSphere search failed",
      })),
      searchGitHub(project, queries).catch((err) => ({
        results: [] as ExternalProjectResult[],
        error: err?.message || "GitHub search failed",
        rateLimited: false,
      })),
      searchWeb(project, queries).catch((err) => ({
        results: [] as ExternalProjectResult[],
        providerName: "Web Search",
        error: err?.message || "Web search failed",
      })),
      searchResearchLiterature(project, queries).catch((err) => ({
        results: [] as ExternalProjectResult[],
        error: err?.message || "Research paper search failed",
      })),
    ]);

  // Track raw counts
  const rawProjectSphereCount = projectSphereResult.results.length;
  const rawGithubCount = githubResult.results.length;
  const rawWebCount = webResult.results.length;
  const rawResearchCount = researchResult.results.length;

  const allRawCandidates: ExternalProjectResult[] = [
    ...projectSphereResult.results,
    ...githubResult.results,
    ...webResult.results,
    ...researchResult.results,
  ];

  // Discovery is metadata-only; spend deeper API calls only on the most relevant GitHub candidates.
  const githubCandidates = allRawCandidates
    .filter(
      (candidate) =>
        candidate.source === "GitHub" || candidate.metadata?.githubRepoUrl,
    )
    .sort((a, b) => (b.stars || 0) - (a.stars || 0))
    .slice(0, GLOBAL_SIMILARITY_CONFIG.MAX_DEEP_ANALYSIS_RESULTS);
  await Promise.all(
    githubCandidates.map(async (candidate) => {
      const analysis = await analyzeGitHubRepository(
        candidate.metadata?.githubRepoUrl || candidate.sourceUrl,
      );
      if (analysis.profile) {
        candidate.repositoryProfile = analysis.profile;
        candidate.description =
          analysis.profile.projectPurpose || candidate.description;
        candidate.technologies = Array.from(
          new Set([
            ...(candidate.technologies || []),
            ...analysis.profile.languages,
            ...analysis.profile.frameworks,
            ...analysis.profile.libraries,
          ]),
        );
        candidate.methodology = `${analysis.profile.architecture.join(", ")}; ${analysis.profile.implementationConcepts.join(", ")}`;
      }
    }),
  );

  // 4. Deduplication
  const deduplicated = deduplicateCandidates(allRawCandidates);

  // 5. Semantic Relevance Pre-Filtering
  const relevantCandidates = filterRelevantCandidates(project, deduplicated);

  // 6. Embedding Provider Initialization
  const embeddingProvider = await getEmbeddingProvider();

  // 7. Multi-Dimensional Semantic Similarity Computation
  const scoredCandidates: ExternalProjectResult[] = await Promise.all(
    relevantCandidates.map((candidate) =>
      compareProjectWithCandidate(project, candidate, embeddingProvider).catch(
        () => ({
          ...candidate,
          similarityScore: 10,
          dimensionScores: {
            problemScore: 10,
            methodologyScore: 10,
            technologyScore: 10,
            domainScore: 10,
            outcomeScore: 10,
            overallWeightedScore: 10,
          },
          commonAreas: ["General alignment"],
          differences: ["Distinct approach"],
          explanation: "Similarity calculation fallback",
        }),
      ),
    ),
  );

  // 8. Result Ranking
  const rankedCandidates = scoredCandidates.sort(
    (a, b) => b.similarityScore - a.similarityScore,
  );

  // 9. Source-wise Statistics Calculation
  const sourceBreakdown: Record<SourceType, SourceStats> = {
    ProjectSphere: calculateSourceStats(
      "ProjectSphere",
      rankedCandidates,
      rawProjectSphereCount,
      projectSphereResult.error,
    ),
    GitHub: calculateSourceStats(
      "GitHub",
      rankedCandidates,
      rawGithubCount,
      githubResult.error ||
        (githubResult.rateLimited
          ? "Rate limited — showing cached results"
          : undefined),
    ),
    Web: calculateSourceStats(
      "Web",
      rankedCandidates,
      rawWebCount,
      webResult.error,
    ),
    "Research Paper": calculateSourceStats(
      "Research Paper",
      rankedCandidates,
      rawResearchCount,
      researchResult.error,
    ),
  };

  // 10. Global High-Level Summary
  const highestCandidate = rankedCandidates[0];
  const highestMatchScore = highestCandidate
    ? highestCandidate.similarityScore
    : 0;
  const highestMatchSource = highestCandidate
    ? highestCandidate.source
    : "ProjectSphere";
  const highestMatchProjectTitle = highestCandidate
    ? highestCandidate.title
    : "None found";

  const averageSimilarity =
    rankedCandidates.length > 0
      ? Math.round(
          rankedCandidates.reduce((acc, c) => acc + c.similarityScore, 0) /
            rankedCandidates.length,
        )
      : 0;

  let overallAssessment: NoveltyAssessment = "LOW OBSERVED SIMILARITY";
  if (highestMatchScore >= GLOBAL_SIMILARITY_THRESHOLD_STRONG) {
    overallAssessment = "STRONG SIMILARITY DETECTED";
  } else if (highestMatchScore >= GLOBAL_SIMILARITY_THRESHOLD_HIGH) {
    overallAssessment = "HIGH OBSERVED SIMILARITY";
  } else if (highestMatchScore >= GLOBAL_SIMILARITY_THRESHOLD_MODERATE) {
    overallAssessment = "MODERATE OBSERVED SIMILARITY";
  }

  // 11. Research Gap Analysis & Differentiation Suggestions
  const researchGaps = synthesizeResearchGaps(project, rankedCandidates);
  const differentiationSuggestions = generateDifferentiationSuggestions(
    project,
    rankedCandidates,
  );

  return {
    id: reportId,
    createdAt: new Date().toISOString(),
    project,
    overallAssessment,
    highestMatchScore,
    highestMatchSource,
    highestMatchProjectTitle,
    averageSimilarity,
    sourcesAnalyzed: {
      projectSphere: rawProjectSphereCount,
      github: rawGithubCount,
      web: rawWebCount,
      research: rawResearchCount,
      total:
        rawProjectSphereCount + rawGithubCount + rawWebCount + rawResearchCount,
    },
    sourceBreakdown,
    queriesExecuted: queries,
    topMatches: rankedCandidates,
    researchGaps,
    differentiationSuggestions,
    disclaimer: GLOBAL_SIMILARITY_CONFIG.DISCLAIMER,
    embeddingEngine: embeddingProvider.name,
    repositoryAnalysis: repositoryAnalysis.profile || null,
    repositoryAnalysisError: repositoryAnalysis.error,
  };
}

const GLOBAL_SIMILARITY_THRESHOLD_MODERATE = 35;
const GLOBAL_SIMILARITY_THRESHOLD_HIGH = 60;
const GLOBAL_SIMILARITY_THRESHOLD_STRONG = 80;

function calculateSourceStats(
  source: SourceType,
  allCandidates: ExternalProjectResult[],
  rawCount: number,
  errorMessage?: string,
): SourceStats {
  const matches = allCandidates.filter((c) => c.source === source);
  const scores = matches.map((m) => m.similarityScore);

  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  let status: SourceStats["status"] = "active";
  if (errorMessage && matches.length === 0) {
    status = errorMessage.includes("rate limit")
      ? "rate_limited"
      : "unavailable";
  } else if (rawCount === 0 && matches.length === 0) {
    status = "empty";
  }

  return {
    source,
    count: matches.length,
    highestScore,
    averageScore,
    status,
    statusMessage: errorMessage,
  };
}
