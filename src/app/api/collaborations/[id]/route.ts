import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { status } = await req.json()

  const request = await prisma.collaborationRequest.findUnique({
    where: { id },
    include: { fromUser: true, project: true },
  })

  if (!request) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  if (request.toUserId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await prisma.collaborationRequest.update({
    where: { id },
    data: { status },
  })

  // If accepted, create collaboration workspace
  if (status === 'ACCEPTED') {
    const collab = await prisma.collaboration.create({
      data: {
        requestId: id,
        projectId: request.projectId,
      },
    })

    // Add both users as members
    await prisma.collaborationMember.createMany({
      data: [
        { collaborationId: collab.id, userId: request.fromUserId, role: 'Initiator' },
        { collaborationId: collab.id, userId: session.user.id, role: 'Collaborator' },
      ],
    })

    // Notify requester
    await prisma.notification.create({
      data: {
        userId: request.fromUserId,
        type: 'COLLABORATION_ACCEPTED',
        title: 'Collaboration request accepted!',
        message: `${session.user.name} accepted your collaboration request for "${request.project.title}".`,
        link: `/collaborations/${collab.id}`,
      },
    })
  } else if (status === 'REJECTED') {
    await prisma.notification.create({
      data: {
        userId: request.fromUserId,
        type: 'COLLABORATION_REJECTED',
        title: 'Collaboration request declined',
        message: `Your collaboration request was not accepted this time.`,
        link: `/collaborations`,
      },
    })
  }

  return NextResponse.json({ success: true, request: updated })
}
