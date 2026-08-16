import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { slugify } from '@/lib/utils'
import { computeProjectSimilarity, findSimilarProjects } from '@/lib/similarity'

const projectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  abstract: z.string().min(50, 'Abstract must be at least 50 characters'),
  problemStatement: z.string().min(20),
  objectives: z.array(z.string()).min(1),
  domain: z.string().min(1),
  subdomain: z.string().optional(),
  technologies: z.array(z.string()).min(1),
  skills: z.array(z.string()).default([]),
  projectType: z.string().default('Academic Research'),
  methodology: z.string().optional(),
  architecture: z.string().optional(),
  dataset: z.string().optional(),
  expectedOutcome: z.string().optional(),
  challenges: z.string().optional(),
  futureScope: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  demoUrl: z.string().url().optional().or(z.literal('')),
  academicYear: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'INSTITUTION_ONLY', 'FACULTY_ONLY', 'PRIVATE']).default('PUBLIC'),
  lookingFor: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  teamMembers: z.array(z.string()).default([]),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  const { searchParams } = new URL(req.url)

  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const query = searchParams.get('q') || ''
  const domain = searchParams.get('domain') || ''
  const technology = searchParams.get('technology') || ''
  const status = searchParams.get('status') || 'PUBLISHED'
  const sort = searchParams.get('sort') || 'newest'
  const institutionId = searchParams.get('institution') || ''

  const skip = (page - 1) * limit

  // Build where clause
  const where: any = {}

  if (status) {
    where.status = status
  } else {
    where.status = { in: ['PUBLISHED', 'APPROVED'] }
  }

  // Visibility filtering
  if (!session?.user) {
    where.visibility = 'PUBLIC'
  } else if (session.user.role === 'STUDENT' || session.user.role === 'FACULTY') {
    where.OR = [
      { visibility: 'PUBLIC' },
      { visibility: 'INSTITUTION_ONLY', institutionId: session.user.institutionId },
    ]
    if (session.user.role === 'FACULTY') {
      where.OR.push({ visibility: 'FACULTY_ONLY', institutionId: session.user.institutionId })
    }
  }

  if (domain) where.domain = domain
  if (institutionId) where.institutionId = institutionId
  if (technology) {
    where.technologies = { contains: technology }
  }

  // Text search
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { abstract: { contains: query, mode: 'insensitive' } },
      { domain: { contains: query, mode: 'insensitive' } },
      { technologies: { contains: query, mode: 'insensitive' } },
      { tags: { contains: query, mode: 'insensitive' } },
    ]
  }

  // Sort
  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'views') orderBy = { viewCount: 'desc' }
  if (sort === 'saved') orderBy = { saveCount: 'desc' }
  if (sort === 'rating') orderBy = { averageRating: 'desc' }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        institution: { select: { id: true, name: true, shortName: true } },
        _count: { select: { savedBy: true, members: true } },
      },
    }),
    prisma.project.count({ where }),
  ])

  // If there's a query, compute relevance scores for semantic-like sorting
  let rankedProjects = projects
  if (query && sort === 'newest') {
    const { computeSearchRelevance } = await import('@/lib/similarity')
    rankedProjects = projects
      .map(p => ({ ...p, _relevance: computeSearchRelevance(query, p as any) }))
      .sort((a, b) => (b as any)._relevance - (a as any)._relevance)
  }

  return NextResponse.json({
    projects: rankedProjects,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = projectSchema.parse(body)

    // Generate unique slug
    let slug = slugify(data.title)
    const existingSlug = await prisma.project.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug,
        abstract: data.abstract,
        problemStatement: data.problemStatement,
        objectives: JSON.stringify(data.objectives),
        domain: data.domain,
        subdomain: data.subdomain || null,
        technologies: JSON.stringify(data.technologies),
        skills: JSON.stringify(data.skills),
        projectType: data.projectType,
        methodology: data.methodology || null,
        architecture: data.architecture || null,
        dataset: data.dataset || null,
        expectedOutcome: data.expectedOutcome || null,
        challenges: data.challenges || null,
        futureScope: data.futureScope || null,
        githubUrl: data.githubUrl || null,
        demoUrl: data.demoUrl || null,
        academicYear: data.academicYear || null,
        visibility: data.visibility,
        lookingFor: JSON.stringify(data.lookingFor),
        tags: JSON.stringify(data.tags),
        status: 'UNDER_REVIEW',
        ownerId: session.user.id,
        institutionId: session.user.institutionId || null,
      },
    })

    // Add team members
    if (data.teamMembers.length > 0) {
      const members = await prisma.user.findMany({
        where: { email: { in: data.teamMembers } },
        select: { id: true },
      })
      await prisma.projectMember.createMany({
        data: members.map(m => ({ projectId: project.id, userId: m.id })),
        skipDuplicates: true,
      })
    }

    // Run similarity analysis in background
    runSimilarityAnalysis(project.id, session.user.id).catch(console.error)

    // Notify faculty in same institution
    if (session.user.institutionId) {
      const faculty = await prisma.user.findMany({
        where: {
          institutionId: session.user.institutionId,
          role: 'FACULTY',
        },
        select: { id: true },
      })
      await prisma.notification.createMany({
        data: faculty.map(f => ({
          userId: f.id,
          type: 'FACULTY_REVIEW' as const,
          title: 'New project pending review',
          message: `"${data.title}" by ${session.user.name} requires your review.`,
          projectId: project.id,
          link: `/faculty/reviews`,
        })),
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_PROJECT',
        resource: 'Project',
        resourceId: project.id,
        details: `Project "${data.title}" created`,
      },
    })

    return NextResponse.json({ success: true, project }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Create project error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function runSimilarityAnalysis(projectId: string, userId: string) {
  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) return

    const allProjects = await prisma.project.findMany({
      where: {
        status: { in: ['PUBLISHED', 'APPROVED'] },
        id: { not: projectId },
      },
      take: 100,
    })

    const similar = findSimilarProjects(project as any, allProjects as any, 10)
      .filter(s => s.similarity.overallScore > 0.3)

    for (const { project: simProject, similarity } of similar) {
      await prisma.projectSimilarity.upsert({
        where: {
          projectAId_projectBId: { projectAId: projectId, projectBId: simProject.id },
        },
        create: {
          projectAId: projectId,
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
          explanation: similarity.explanation,
        },
      })
    }

    // Notify user if high similarity found
    const highSim = similar.filter(s => s.similarity.overallScore >= 0.6)
    if (highSim.length > 0) {
      const topSim = highSim[0]
      await prisma.notification.create({
        data: {
          userId,
          type: 'SIMILAR_PROJECT_DETECTED',
          title: 'Similar project found',
          message: `Your project shows ${Math.round(topSim.similarity.overallScore * 100)}% similarity with "${topSim.project.title}". Review the similarity report.`,
          projectId,
          link: `/projects/${projectId}/similarity`,
        },
      })
    }
  } catch (error) {
    console.error('Similarity analysis error:', error)
  }
}
