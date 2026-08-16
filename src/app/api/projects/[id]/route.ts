import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true, name: true, email: true, avatarUrl: true,
          course: true, skills: true, domains: true,
          institution: { select: { id: true, name: true, shortName: true } },
        },
      },
      institution: true,
      members: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, course: true } },
        },
      },
      files: true,
      facultyReviews: {
        include: {
          faculty: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { reviewedAt: 'desc' },
        take: 1,
      },
      similarityA: {
        include: {
          projectB: {
            include: {
              owner: { select: { id: true, name: true } },
              institution: { select: { name: true, shortName: true } },
            },
          },
        },
        orderBy: { overallScore: 'desc' },
        take: 5,
      },
      insights: { take: 1, orderBy: { generatedAt: 'desc' } },
      _count: { select: { savedBy: true, members: true } },
    },
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Visibility check
  if (project.visibility === 'PRIVATE' && project.ownerId !== session?.user?.id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Increment view count
  await prisma.project.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {}) // Non-critical

  // Check if saved by current user
  let isSaved = false
  if (session?.user?.id) {
    const saved = await prisma.savedProject.findUnique({
      where: { userId_projectId: { userId: session.user.id, projectId: id } },
    })
    isSaved = !!saved
  }

  return NextResponse.json({ project, isSaved })
}

export async function PATCH(
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

  const isOwner = project.ownerId === session.user.id
  const isAdmin = session.user.role === 'PLATFORM_ADMIN'
  const isFaculty = session.user.role === 'FACULTY'

  if (!isOwner && !isAdmin && !isFaculty) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const updated = await prisma.project.update({
    where: { id },
    data: body,
  })

  return NextResponse.json({ project: updated })
}

export async function DELETE(
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

  if (project.ownerId !== session.user.id && session.user.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.project.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
