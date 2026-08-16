import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const requestSchema = z.object({
  toUserId: z.string(),
  projectId: z.string(),
  message: z.string().min(10),
  skillsOffered: z.array(z.string()).default([]),
  skillsNeeded: z.array(z.string()).default([]),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const requests = await prisma.collaborationRequest.findMany({
    where: {
      OR: [
        { fromUserId: session.user.id },
        { toUserId: session.user.id },
      ],
    },
    include: {
      fromUser: { select: { id: true, name: true, avatarUrl: true, institution: { select: { name: true } } } },
      toUser: { select: { id: true, name: true, avatarUrl: true, institution: { select: { name: true } } } },
      project: { select: { id: true, title: true, domain: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ requests })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = requestSchema.parse(body)

    // Check no duplicate pending request
    const existing = await prisma.collaborationRequest.findFirst({
      where: {
        fromUserId: session.user.id,
        toUserId: data.toUserId,
        projectId: data.projectId,
        status: 'PENDING',
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'You already have a pending request for this project' }, { status: 409 })
    }

    const request = await prisma.collaborationRequest.create({
      data: {
        fromUserId: session.user.id,
        toUserId: data.toUserId,
        projectId: data.projectId,
        message: data.message,
        skillsOffered: JSON.stringify(data.skillsOffered),
        skillsNeeded: JSON.stringify(data.skillsNeeded),
      },
    })

    // Notify recipient
    await prisma.notification.create({
      data: {
        userId: data.toUserId,
        type: 'COLLABORATION_REQUEST',
        title: 'New collaboration request',
        message: `${session.user.name} sent you a collaboration request.`,
        link: `/collaborations`,
      },
    })

    return NextResponse.json({ success: true, request }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
