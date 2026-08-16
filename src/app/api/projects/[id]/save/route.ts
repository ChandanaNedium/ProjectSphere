import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// Save / unsave a project
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const collection = body.collection || 'General'

  const existing = await prisma.savedProject.findUnique({
    where: { userId_projectId: { userId: session.user.id, projectId: id } },
  })

  if (existing) {
    await prisma.savedProject.delete({
      where: { userId_projectId: { userId: session.user.id, projectId: id } },
    })
    await prisma.project.update({
      where: { id },
      data: { saveCount: { decrement: 1 } },
    }).catch(() => {})
    return NextResponse.json({ saved: false })
  }

  await prisma.savedProject.create({
    data: {
      userId: session.user.id,
      projectId: id,
      collection,
    },
  })
  await prisma.project.update({
    where: { id },
    data: { saveCount: { increment: 1 } },
  }).catch(() => {})

  return NextResponse.json({ saved: true })
}
