import { NextRequest, NextResponse } from 'next/server'
import { computeProjectSimilarity } from '@/lib/similarity'
import { prisma } from '@/lib/db'
import { SAMPLE_PROJECTS } from '@/lib/projects'
import { safeParseJson } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, domain, technologies, methodology } = body

    if (!title || !description) {
      return NextResponse.json(
        { ok: false, error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const currentProject = {
      id: 'query-project',
      title: String(title).trim(),
      abstract: String(description).trim(),
      problemStatement: String(description).trim(),
      domain: domain || 'General',
      technologies: Array.isArray(technologies) ? JSON.stringify(technologies) : JSON.stringify((technologies || '').split(',').map((t: string) => t.trim())),
      skills: JSON.stringify([]),
      tags: JSON.stringify([]),
      methodology: methodology || null,
    }

    // Retrieve local candidates
    const candidates: any[] = []

    try {
      const dbProjects = await prisma.project.findMany({
        take: 30,
        select: {
          id: true,
          title: true,
          abstract: true,
          problemStatement: true,
          domain: true,
          subdomain: true,
          technologies: true,
          skills: true,
          tags: true,
          methodology: true,
          academicYear: true,
          institution: { select: { name: true } },
        },
      })
      for (const p of dbProjects) {
        if (p.title.toLowerCase() === currentProject.title.toLowerCase()) continue
        candidates.push({
          ...p,
          college: p.institution?.name || 'Partner College',
          year: p.academicYear || '2024',
        })
      }
    } catch {
      // Prisma DB fallback
    }

    for (const sample of SAMPLE_PROJECTS) {
      if (sample.title.toLowerCase() === currentProject.title.toLowerCase()) continue
      candidates.push({
        id: sample.id,
        title: sample.title,
        abstract: sample.description,
        problemStatement: sample.description,
        domain: sample.domain,
        technologies: JSON.stringify(sample.tech),
        skills: JSON.stringify([]),
        tags: JSON.stringify([]),
        methodology: null,
        college: sample.college,
        year: sample.year,
      })
    }

    const scored = candidates.map(c => {
      const sim = computeProjectSimilarity(currentProject, c)
      return {
        id: c.id,
        title: c.title,
        college: c.college || 'Institution',
        year: c.year || 2024,
        overallSim: Math.round(sim.overallScore * 100),
        breakdown: {
          'Problem Domain': Math.round(sim.domainScore * 100),
          'Methodology': Math.round(sim.methodScore * 100),
          'Technology': Math.round(sim.techScore * 100),
          'Description': Math.round(sim.descScore * 100),
        },
        explanation: sim.explanation,
        commonAreas: sim.commonAreas,
        differences: sim.differences,
      }
    })

    scored.sort((a, b) => b.overallSim - a.overallSim)

    const topSimilar = scored.slice(0, 5)
    const highestScore = topSimilar[0]?.overallSim || 15

    return NextResponse.json({
      ok: true,
      data: {
        overall: highestScore,
        breakdown: topSimilar[0]?.breakdown || {
          'Problem Domain': 20,
          'Methodology': 15,
          'Technology': 10,
          'Description': 15,
        },
        similar: topSimilar,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 })
  }
}
