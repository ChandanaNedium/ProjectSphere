import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'CHANGES_REQUESTED', 'REJECTED']),
  feedback: z.string().optional(),
})

// GET: Pending projects for faculty review
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'FACULTY' && session.user.role !== 'PLATFORM_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const where: any = { status: 'UNDER_REVIEW' }
  if (session.user.role === 'FACULTY' && session.user.institutionId) {
    where.institutionId = session.user.institutionId
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, email: true, course: true, year: true } },
      institution: { select: { name: true } },
      similarityA: { orderBy: { overallScore: 'desc' }, take: 3 },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ projects })
}

// POST: Submit a review
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'FACULTY' && session.user.role !== 'PLATFORM_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { projectId, ...reviewData } = body
    const data = reviewSchema.parse(reviewData)

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const newStatus = data.status === 'APPROVED' ? 'APPROVED' : data.status

    // Create review record
    await prisma.facultyReview.create({
      data: {
        projectId,
        facultyId: session.user.id,
        status: newStatus,
        feedback: data.feedback || null,
      },
    })

    // Update project status
    const updatedStatus = data.status === 'APPROVED' ? 'PUBLISHED' :
      data.status === 'CHANGES_REQUESTED' ? 'CHANGES_REQUESTED' : 'REJECTED'

    await prisma.project.update({
      where: { id: projectId },
      data: { status: updatedStatus },
    })

    // Notify project owner
    const notifType = data.status === 'APPROVED' ? 'PROJECT_APPROVED' :
      data.status === 'CHANGES_REQUESTED' ? 'PROJECT_CHANGES_REQUESTED' : 'PROJECT_REJECTED'

    const notifTitle = data.status === 'APPROVED' ? 'Project approved!' :
      data.status === 'CHANGES_REQUESTED' ? 'Changes requested for your project' : 'Project not approved'

    await prisma.notification.create({
      data: {
        userId: project.ownerId,
        type: notifType,
        title: notifTitle,
        message: data.feedback || (data.status === 'APPROVED'
          ? 'Congratulations! Your project has been approved and published.'
          : 'Please review the feedback from your faculty.'),
        projectId,
        link: `/projects/${projectId}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
