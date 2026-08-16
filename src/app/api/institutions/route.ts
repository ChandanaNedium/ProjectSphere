import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const institutions = await prisma.institution.findMany({
    include: {
      _count: { select: { users: true, projects: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ institutions })
}
