import { NextRequest, NextResponse } from "next/server";
import { computeProjectSimilarity } from "@/lib/similarity";
import { prisma } from "@/lib/db";
import { SAMPLE_PROJECTS } from "@/lib/projects";
import { safeParseJson } from "@/lib/utils";
import { analyzeGitHubRepository } from "@/lib/github-repository-analyzer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      domain,
      technologies,
      methodology,
      githubRepoUrl,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { ok: false, error: "Title and description are required" },
        { status: 400 },
      );
    }

    const repositoryAnalysis = githubRepoUrl
      ? await analyzeGitHubRepository(String(githubRepoUrl).trim())
      : { ok: false as const };
    const repositoryText = repositoryAnalysis.profile?.profileText || "";
    const repositoryTech = repositoryAnalysis.profile
      ? [
          ...repositoryAnalysis.profile.languages,
          ...repositoryAnalysis.profile.frameworks,
          ...repositoryAnalysis.profile.libraries,
        ]
      : [];
    const currentProject = {
      id: "query-project",
      title: String(title).trim(),
      abstract: `${String(description).trim()}\n${repositoryText}`,
      problemStatement: `${String(description).trim()}\n${repositoryAnalysis.profile?.projectPurpose || ""}`,
      domain: domain || "General",
      technologies: JSON.stringify(
        Array.from(
          new Set([
            ...(Array.isArray(technologies)
              ? technologies
              : (technologies || "").split(",").map((t: string) => t.trim())),
            ...repositoryTech,
          ]),
        ),
      ),
      skills: JSON.stringify([]),
      tags: JSON.stringify([]),
      methodology: methodology || null,
    };

    // Retrieve local candidates
    const candidates: any[] = [];

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
          githubUrl: true,
          academicYear: true,
          institution: { select: { name: true } },
        },
      });
      for (const p of dbProjects) {
        if (p.title.toLowerCase() === currentProject.title.toLowerCase())
          continue;
        candidates.push({
          ...p,
          college: p.institution?.name || "Partner College",
          year: p.academicYear || "2024",
          githubRepoUrl: p.githubUrl,
        });
      }
    } catch {
      // Prisma DB fallback
    }

    for (const sample of SAMPLE_PROJECTS) {
      if (sample.title.toLowerCase() === currentProject.title.toLowerCase())
        continue;
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
      });
    }

    const candidatesWithRepositories = candidates
      .filter((candidate) => candidate.githubRepoUrl)
      .slice(0, 4);
    await Promise.all(
      candidatesWithRepositories.map(async (candidate) => {
        const analysis = await analyzeGitHubRepository(candidate.githubRepoUrl);
        if (analysis.profile) {
          candidate.abstract = `${candidate.abstract}\n${analysis.profile.profileText}`;
          candidate.problemStatement = `${candidate.problemStatement}\n${analysis.profile.projectPurpose}`;
          candidate.technologies = JSON.stringify(
            Array.from(
              new Set([
                ...safeParseJson<string[]>(candidate.technologies, []),
                ...analysis.profile.languages,
                ...analysis.profile.frameworks,
                ...analysis.profile.libraries,
              ]),
            ),
          );
        }
      }),
    );

    const scored = candidates.map((c) => {
      const sim = computeProjectSimilarity(currentProject, c);
      return {
        id: c.id,
        title: c.title,
        college: c.college || "Institution",
        year: c.year || 2024,
        overallSim: Math.round(sim.overallScore * 100),
        breakdown: {
          "Problem Domain": Math.round(sim.domainScore * 100),
          Methodology: Math.round(sim.methodScore * 100),
          Technology: Math.round(sim.techScore * 100),
          Description: Math.round(sim.descScore * 100),
        },
        explanation: sim.explanation,
        commonAreas: sim.commonAreas,
        differences: sim.differences,
      };
    });

    scored.sort((a, b) => b.overallSim - a.overallSim);

    const topSimilar = scored.slice(0, 5);
    const highestScore = topSimilar[0]?.overallSim || 15;

    return NextResponse.json({
      ok: true,
      data: {
        overall: highestScore,
        breakdown: topSimilar[0]?.breakdown || {
          "Problem Domain": 20,
          Methodology: 15,
          Technology: 10,
          Description: 15,
        },
        similar: topSimilar,
        repositoryAnalysis: repositoryAnalysis.profile || null,
        repositoryAnalysisError: repositoryAnalysis.error,
        analysisMode: repositoryAnalysis.profile
          ? "repository-enhanced"
          : "metadata-only",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message },
      { status: 500 },
    );
  }
}
