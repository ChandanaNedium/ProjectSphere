import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      institution: true,
      ownedProjects: {
        include: {
          institution: { select: { name: true, shortName: true } },
          _count: { select: { savedBy: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      savedProjects: {
        include: {
          project: {
            include: {
              owner: { select: { name: true } },
              institution: { select: { name: true, shortName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      notifications: {
        where: { read: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      recommendations: {
        include: {
          project: {
            include: {
              owner: { select: { name: true } },
              institution: { select: { name: true, shortName: true } },
            },
          },
        },
        orderBy: { score: 'desc' },
        take: 8,
        where: { viewed: false },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Compute dashboard stats
  const [similarityChecks, collaborationRequests] = await Promise.all([
    prisma.projectSimilarity.count({
      where: {
        OR: [
          { projectA: { ownerId: session.user.id } },
          { projectB: { ownerId: session.user.id } },
        ],
      },
    }),
    prisma.collaborationRequest.count({
      where: {
        OR: [
          { fromUserId: session.user.id },
          { toUserId: session.user.id },
        ],
      },
    }),
  ])

  return NextResponse.json({
    user: {
      ...user,
      password: undefined,
    },
    stats: {
      projectsSubmitted: user.ownedProjects.length,
      projectsSaved: user.savedProjects.length,
      similarityChecks,
      collaborationRequests,
      unreadNotifications: user.notifications.length,
    },
  })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, bio, course, year, skills, domains, githubUrl, linkedinUrl } = body

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(course !== undefined && { course }),
      ...(year !== undefined && { year }),
      ...(skills && { skills: JSON.stringify(skills) }),
      ...(domains && { domains: JSON.stringify(domains) }),
      ...(githubUrl !== undefined && { githubUrl }),
      ...(linkedinUrl !== undefined && { linkedinUrl }),
    },
    select: {
      id: true, name: true, email: true, bio: true, course: true,
      year: true, skills: true, domains: true, githubUrl: true, linkedinUrl: true,
    },
  })

  return NextResponse.json({ user: updated })
}
