import {
  ExternalProjectResult,
  SimilarityDimensionScores,
  StructuredProjectRepresentation,
} from "../types";
import { EmbeddingProvider } from "../embeddings/provider";
import { cosineSimilarity, tokenizeText } from "../embeddings/vector-math";
import { SIMILARITY_WEIGHTS } from "../config";

/**
 * Compare a student's structured project representation with a candidate project
 * across 5 dimensions using real embedding vector cosine similarity.
 */
export async function compareProjectWithCandidate(
  project: StructuredProjectRepresentation,
  candidate: ExternalProjectResult,
  embeddingProvider: EmbeddingProvider,
): Promise<ExternalProjectResult> {
  const candidateTech = candidate.technologies || [];
  const candidateMethod =
    candidate.methodology ||
    candidate.repositoryProfile?.profileText ||
    candidate.description;
  const candidateProblem =
    candidate.problemStatement ||
    candidate.repositoryProfile?.projectPurpose ||
    candidate.description;
  const candidateOutcome = candidate.expectedOutcome || candidate.description;

  // 1. Prepare dimension text pairs
  const textPairs: Array<{
    dimension: keyof SimilarityDimensionScores;
    textA: string;
    textB: string;
  }> = [
    {
      dimension: "problemScore",
      textA: `Problem statement: ${project.problem}`,
      textB: `Problem statement: ${candidateProblem}`,
    },
    {
      dimension: "methodologyScore",
      textA: `Methodology and Architecture: ${project.methodology}. Repository architecture: ${project.architecture}. Implementation concepts: ${project.implementationConcepts.join(", ")}`,
      textB: `Methodology and Architecture: ${candidateMethod}. Implementation concepts: ${candidate.repositoryProfile?.implementationConcepts.join(", ") || ""}`,
    },
    {
      dimension: "technologyScore",
      textA: `Technologies: ${[...project.technologies, ...project.implementationConcepts].join(", ")}`,
      textB: `Technologies: ${[...candidateTech, ...(candidate.repositoryProfile?.implementationConcepts || [])].join(", ")}`,
    },
    {
      dimension: "domainScore",
      textA: `Domain: ${project.domain}`,
      textB: `Domain: ${candidate.domain || project.domain}`,
    },
    {
      dimension: "outcomeScore",
      textA: `Expected Outcome: ${project.expectedOutcome}`,
      textB: `Expected Outcome: ${candidateOutcome}`,
    },
  ];

  // 2. Batch embed dimension texts
  const allTexts: string[] = [];
  for (const pair of textPairs) {
    allTexts.push(pair.textA);
    allTexts.push(pair.textB);
  }

  const embeddings = await embeddingProvider.embedBatch(allTexts);

  // 3. Compute cosine similarity for each dimension
  const rawScores: Record<string, number> = {};
  for (let i = 0; i < textPairs.length; i++) {
    const embA = embeddings[i * 2];
    const embB = embeddings[i * 2 + 1];
    const cos = cosineSimilarity(embA, embB);
    rawScores[textPairs[i].dimension] = cos;
  }

  // Jaccard boost for explicit technology set intersection
  const projectTechSet = new Set(
    [...project.technologies, ...project.implementationConcepts].map((t) =>
      t.toLowerCase(),
    ),
  );
  const candidateTechSet = new Set(
    [
      ...candidateTech,
      ...(candidate.repositoryProfile?.implementationConcepts || []),
    ].map((t) => t.toLowerCase()),
  );
  let techJaccard = 0;
  if (projectTechSet.size > 0 && candidateTechSet.size > 0) {
    const inter = new Set(
      [...projectTechSet].filter((x) => candidateTechSet.has(x)),
    );
    const un = new Set([...projectTechSet, ...candidateTechSet]);
    techJaccard = inter.size / un.size;
  }

  // Combined tech score (60% embedding vector + 40% exact token overlap)
  const combinedTechScore =
    (rawScores["technologyScore"] || 0) * 0.6 + techJaccard * 0.4;

  const problemScore = Math.min(
    100,
    Math.round((rawScores["problemScore"] || 0) * 100),
  );
  const methodologyScore = Math.min(
    100,
    Math.round((rawScores["methodologyScore"] || 0) * 100),
  );
  const technologyScore = Math.min(100, Math.round(combinedTechScore * 100));
  const domainScore = Math.min(
    100,
    Math.round((rawScores["domainScore"] || 0) * 100),
  );
  const outcomeScore = Math.min(
    100,
    Math.round((rawScores["outcomeScore"] || 0) * 100),
  );

  // 4. Calculate weighted composite score
  const overallWeighted =
    problemScore * SIMILARITY_WEIGHTS.PROBLEM +
    methodologyScore * SIMILARITY_WEIGHTS.METHODOLOGY +
    technologyScore * SIMILARITY_WEIGHTS.TECHNOLOGY +
    domainScore * SIMILARITY_WEIGHTS.DOMAIN +
    outcomeScore * SIMILARITY_WEIGHTS.OUTCOME;

  const finalScore = Math.min(99, Math.max(1, Math.round(overallWeighted)));

  const dimensionScores: SimilarityDimensionScores = {
    problemScore,
    methodologyScore,
    technologyScore,
    domainScore,
    outcomeScore,
    overallWeightedScore: finalScore,
  };

  // 5. Extract Similarities and Differences
  const { commonAreas, differences } = extractSimilaritiesAndDifferences(
    project,
    candidate,
  );

  // 6. Generate Contextual Explanation
  const explanation = generateExplanation(
    project,
    candidate,
    finalScore,
    dimensionScores,
    commonAreas,
  );

  return {
    ...candidate,
    similarityScore: finalScore,
    dimensionScores,
    commonAreas,
    differences,
    explanation,
  };
}

/**
 * Extract tangible commonalities and distinguishing aspects between two projects
 */
function extractSimilaritiesAndDifferences(
  project: StructuredProjectRepresentation,
  candidate: ExternalProjectResult,
): { commonAreas: string[]; differences: string[] } {
  const commonAreas: string[] = [];
  const differences: string[] = [];

  const projectTokens = new Set(
    tokenizeText(
      `${project.title} ${project.problem} ${project.methodology} ${project.implementationConcepts.join(" ")}`,
    ),
  );
  const candidateTokens = new Set(
    tokenizeText(
      `${candidate.title} ${candidate.description} ${candidate.repositoryProfile?.profileText || ""}`,
    ),
  );

  // Common concepts
  const sharedTokens = [...projectTokens].filter(
    (t) => candidateTokens.has(t) && t.length > 3,
  );
  if (sharedTokens.length > 0) {
    commonAreas.push(...sharedTokens.slice(0, 4).map(capitalizeWord));
  }

  // Common Tech
  const projectTech = [
    ...project.technologies,
    ...project.implementationConcepts,
  ].map((t) => t.toLowerCase());
  const candidateTech = [
    ...(candidate.technologies || []),
    ...(candidate.repositoryProfile?.implementationConcepts || []),
  ].map((t) => t.toLowerCase());
  const sharedTech = projectTech.filter((t) => candidateTech.includes(t));
  if (sharedTech.length > 0) {
    commonAreas.push(
      `Shared stack: ${sharedTech.slice(0, 3).map(capitalizeWord).join(", ")}`,
    );
  }

  // Distinct Project Tech/Approaches
  const uniqueProjectTech = project.technologies.filter(
    (t) => !candidateTech.includes(t.toLowerCase()),
  );
  if (uniqueProjectTech.length > 0) {
    differences.push(
      `Your unique stack: ${uniqueProjectTech.slice(0, 2).join(", ")}`,
    );
  }

  const uniqueCandidateTech = (candidate.technologies || []).filter(
    (t) => !projectTech.includes(t.toLowerCase()),
  );
  if (uniqueCandidateTech.length > 0) {
    differences.push(
      `Target work relies on: ${uniqueCandidateTech.slice(0, 2).join(", ")}`,
    );
  }

  if (candidate.source === "Research Paper" && candidate.institutionOrVenue) {
    differences.push(`Academic venue: ${candidate.institutionOrVenue}`);
  } else if (candidate.stars && candidate.stars > 0) {
    differences.push(`Community traction: ${candidate.stars} GitHub stars`);
  }

  // Ensure non-empty fallbacks
  if (commonAreas.length === 0) {
    commonAreas.push(`${project.domain} domain scope`, "Conceptual alignment");
  }
  if (differences.length === 0) {
    differences.push(
      "Distinct implementation architecture",
      "Differentiated dataset / target environment",
    );
  }

  return {
    commonAreas: Array.from(new Set(commonAreas)).slice(0, 4),
    differences: Array.from(new Set(differences)).slice(0, 4),
  };
}

function capitalizeWord(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateExplanation(
  project: StructuredProjectRepresentation,
  candidate: ExternalProjectResult,
  overallScore: number,
  dim: SimilarityDimensionScores,
  common: string[],
): string {
  const commonStr = common.slice(0, 2).join(", ");
  if (overallScore >= 75) {
    return `Strong semantic overlap detected with ${candidate.source} work (${overallScore}%). Both solutions target very similar problem scopes (${dim.problemScore}% problem alignment) with intersecting techniques (${commonStr || "methodology"}). Significant differentiation is recommended.`;
  } else if (overallScore >= 55) {
    return `Moderate overlap with ${candidate.source} candidate (${overallScore}%). While the domain (${dim.domainScore}%) and core problem (${dim.problemScore}%) share thematic parallels, the implementation nuances and technology stacks differ.`;
  } else if (overallScore >= 35) {
    return `Noticeable conceptual relationship (${overallScore}%), primarily within the ${project.domain} problem landscape. Approaches and tooling remain distinct.`;
  } else {
    return `Low similarity (${overallScore}%). The candidate addresses a different sub-problem or utilizes completely distinct methodologies.`;
  }
}
