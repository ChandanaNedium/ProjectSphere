import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const [
    totalProjects,
    totalInstitutions,
    totalUsers,
    totalCollaborations,
    domainCounts,
    techCounts,
    recentProjects,
  ] = await Promise.all([
    prisma.project.count({ where: { status: { in: ['PUBLISHED', 'APPROVED'] } } }),
    prisma.institution.count({ where: { verified: true } }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.collaboration.count(),
    prisma.project.groupBy({
      by: ['domain'],
      _count: { domain: true },
      where: { status: { in: ['PUBLISHED', 'APPROVED'] } },
      orderBy: { _count: { domain: 'desc' } },
    }),
    prisma.project.findMany({
      where: { status: { in: ['PUBLISHED', 'APPROVED'] } },
      select: { technologies: true },
    }),
    prisma.project.findMany({
      where: { status: { in: ['PUBLISHED', 'APPROVED'] } },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        owner: { select: { name: true } },
        institution: { select: { shortName: true } },
      },
    }),
  ])

  // Count technologies across all projects
  const techMap: Record<string, number> = {}
  for (const p of techCounts) {
    try {
      const techs = JSON.parse(p.technologies) as string[]
      techs.forEach(t => { techMap[t] = (techMap[t] || 0) + 1 })
    } catch {}
  }

  const topTechnologies = Object.entries(techMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  return NextResponse.json({
    stats: {
      totalProjects,
      totalInstitutions,
      totalStudents: totalUsers,
      totalCollaborations,
      totalDomains: domainCounts.length,
    },
    domainDistribution: domainCounts.map(d => ({
      domain: d.domain,
      count: d._count.domain,
    })),
    topTechnologies,
    recentProjects,
  })
}
