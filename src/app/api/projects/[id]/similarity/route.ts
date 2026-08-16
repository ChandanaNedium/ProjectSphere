import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET similarity report for a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true, title: true, domain: true, technologies: true, status: true,
      ownerId: true, visibility: true,
    },
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const similarities = await prisma.projectSimilarity.findMany({
    where: {
      OR: [{ projectAId: id }, { projectBId: id }],
    },
    include: {
      projectA: {
        include: {
          owner: { select: { name: true } },
          institution: { select: { name: true, shortName: true } },
        },
      },
      projectB: {
        include: {
          owner: { select: { name: true } },
          institution: { select: { name: true, shortName: true } },
        },
      },
    },
    orderBy: { overallScore: 'desc' },
  })

  // Normalize so the current project is always projectA
  const normalized = similarities.map(sim => {
    if (sim.projectAId === id) {
      return { ...sim, relatedProject: sim.projectB }
    } else {
      return {
        ...sim,
        projectAId: sim.projectBId,
        projectBId: sim.projectAId,
        relatedProject: sim.projectA,
      }
    }
  })

  // Compute aggregated stats
  const maxScore = normalized.length > 0 ? Math.max(...normalized.map(s => s.overallScore)) : 0
  const avgScore = normalized.length > 0
    ? normalized.reduce((sum, s) => sum + s.overallScore, 0) / normalized.length
    : 0

  return NextResponse.json({
    projectId: id,
    maxSimilarityScore: maxScore,
    averageSimilarityScore: avgScore,
    totalMatches: normalized.length,
    similarities: normalized,
    originality: {
      score: Math.max(0, 1 - maxScore),
      label: maxScore < 0.4 ? 'High' : maxScore < 0.7 ? 'Moderate' : 'Low',
      textSimilarity: maxScore > 0 ? normalized[0]?.descScore || 0 : 0,
      techSimilarity: maxScore > 0 ? normalized[0]?.techScore || 0 : 0,
    },
  })
}

// POST: trigger a fresh similarity analysis
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Import and run similarity
  const { findSimilarProjects } = await import('@/lib/similarity')

  const allProjects = await prisma.project.findMany({
    where: { status: { in: ['PUBLISHED', 'APPROVED'] }, id: { not: id } },
    take: 100,
  })

  const similar = findSimilarProjects(project as any, allProjects as any, 10)
    .filter(s => s.similarity.overallScore > 0.25)

  for (const { project: simProject, similarity } of similar) {
    await prisma.projectSimilarity.upsert({
      where: { projectAId_projectBId: { projectAId: id, projectBId: simProject.id } },
      create: {
        projectAId: id,
        projectBId: simProject.id,
        overallScore: similarity.overallScore,
        problemScore: similarity.problemScore,
        techScore: similarity.techScore,
        methodScore: similarity.methodScore,
        descScore: similarity.descScore,
        explanation: similarity.explanation,
        commonAreas: JSON.stringify(similarity.commonAreas),
        differences: JSON.stringify(similarity.differences),
      },
      update: {
        overallScore: similarity.overallScore,
        problemScore: similarity.problemScore,
        techScore: similarity.techScore,
        methodScore: similarity.methodScore,
        descScore: similarity.descScore,
        explanation: similarity.explanation,
        commonAreas: JSON.stringify(similarity.commonAreas),
        differences: JSON.stringify(similarity.differences),
      },
    })
  }

  return NextResponse.json({
    success: true,
    message: 'Similarity analysis complete',
    matchesFound: similar.length,
  })
}
