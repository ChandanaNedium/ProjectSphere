import { prisma } from '@/lib/db'
import { SAMPLE_PROJECTS } from '@/lib/projects'
import {
  ExternalProjectResult,
  GeneratedQuery,
  StructuredProjectRepresentation,
} from '../types'
import { GLOBAL_SIMILARITY_CONFIG } from '../config'
import { safeParseJson } from '@/lib/utils'

export async function searchProjectSphere(
  project: StructuredProjectRepresentation,
  queries: GeneratedQuery[]
): Promise<{ results: ExternalProjectResult[]; error?: string }> {
  try {
    const candidatesMap = new Map<string, ExternalProjectResult>()

    // 1. Search Prisma database if accessible
    try {
      const dbProjects = await prisma.project.findMany({
        take: GLOBAL_SIMILARITY_CONFIG.MAX_PROJECTSPHERE_RESULTS * 2,
        select: {
          id: true,
          title: true,
          abstract: true,
          problemStatement: true,
          domain: true,
          subdomain: true,
          technologies: true,
          methodology: true,
          expectedOutcome: true,
          academicYear: true,
          owner: {
            select: { name: true },
          },
          institution: {
            select: { name: true },
          },
        },
      })

      for (const p of dbProjects) {
        // Exclude exact self if title is identical
        if (p.title.toLowerCase() === project.title.toLowerCase()) continue

        const techList = safeParseJson<string[]>(p.technologies, [])
        candidatesMap.set(`ps-db-${p.id}`, {
          id: `ps-${p.id}`,
          title: p.title,
          description: p.abstract || p.problemStatement || '',
          source: 'ProjectSphere',
          sourceUrl: `/project/${p.id}`,
          domain: p.domain,
          technologies: techList,
          methodology: p.methodology || undefined,
          problemStatement: p.problemStatement || undefined,
          expectedOutcome: p.expectedOutcome || undefined,
          authors: p.owner?.name ? [p.owner.name] : ['ProjectSphere Student'],
          institutionOrVenue: p.institution?.name || 'Partner Institution',
          date: p.academicYear || '2024',
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
    } catch {
      // Prisma DB query failed or table empty, proceed to sample projects
    }

    // 2. Search SAMPLE_PROJECTS repository store
    for (const sample of SAMPLE_PROJECTS) {
      if (sample.title.toLowerCase() === project.title.toLowerCase()) continue

      candidatesMap.set(`ps-sample-${sample.id}`, {
        id: `ps-${sample.id}`,
        title: sample.title,
        description: sample.description,
        source: 'ProjectSphere',
        sourceUrl: sample.github || `/project/${sample.id}`,
        domain: sample.domain,
        technologies: sample.tech,
        authors: sample.students,
        institutionOrVenue: sample.college,
        date: String(sample.year),
        stars: sample.stars,
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

    const allCandidates = Array.from(candidatesMap.values()).slice(
      0,
      GLOBAL_SIMILARITY_CONFIG.MAX_PROJECTSPHERE_RESULTS
    )

    return { results: allCandidates }
  } catch (error: any) {
    return {
      results: [],
      error: `ProjectSphere database search encountered an error: ${error?.message || error}`,
    }
  }
}
