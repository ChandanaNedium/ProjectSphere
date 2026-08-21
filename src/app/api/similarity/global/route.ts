import { NextRequest, NextResponse } from "next/server";
import { runGlobalSimilarityCheck } from "@/lib/global-similarity/orchestrator";
import { ProjectInput } from "@/lib/global-similarity/types";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      domain,
      technologies,
      methodology,
      problemStatement,
      expectedOutcome,
      userId,
      projectId,
      githubRepoUrl,
    } = body;

    if (!title || !description || !domain) {
      return NextResponse.json(
        {
          ok: false,
          error: "Title, description, and domain are required fields.",
        },
        { status: 400 },
      );
    }

    const input: ProjectInput = {
      title: String(title).trim(),
      description: String(description).trim(),
      domain: String(domain).trim(),
      technologies: technologies || [],
      methodology: methodology ? String(methodology).trim() : undefined,
      problemStatement: problemStatement
        ? String(problemStatement).trim()
        : undefined,
      expectedOutcome: expectedOutcome
        ? String(expectedOutcome).trim()
        : undefined,
      githubRepoUrl: githubRepoUrl ? String(githubRepoUrl).trim() : undefined,
    };

    // Run the full global similarity discovery and semantic evaluation pipeline
    const report = await runGlobalSimilarityCheck(input);

    // Save report to database for audit & reproduction
    try {
      await (prisma as any).globalSimilarityCheck?.create({
        data: {
          id: report.id,
          userId: userId || undefined,
          projectId: projectId || undefined,
          projectTitle: report.project.title,
          projectDomain: report.project.domain,
          technologies: JSON.stringify(report.project.technologies),
          methodology: report.project.methodology,
          problemStatement: report.project.problem,
          overallScore: report.highestMatchScore,
          assessment: report.overallAssessment,
          highestMatch: report.highestMatchScore,
          highestSource: report.highestMatchSource,
          sourcesAnalyzed: JSON.stringify(report.sourcesAnalyzed),
          sourceScores: JSON.stringify(report.sourceBreakdown),
          queriesGenerated: JSON.stringify(report.queriesExecuted),
          topMatches: JSON.stringify(report.topMatches.slice(0, 15)),
          researchGaps: JSON.stringify(report.researchGaps),
          suggestions: JSON.stringify(report.differentiationSuggestions),
        },
      });
    } catch (dbErr) {
      console.warn("Could not persist GlobalSimilarityCheck to DB:", dbErr);
    }

    return NextResponse.json({
      ok: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error running Global Similarity Check:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "An unexpected error occurred during global similarity analysis.",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const record = await (prisma as any).globalSimilarityCheck?.findUnique({
        where: { id },
      });
      if (!record) {
        return NextResponse.json(
          { ok: false, error: "Report not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ ok: true, data: record });
    }

    const checks = await (prisma as any).globalSimilarityCheck?.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, data: checks });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message },
      { status: 500 },
    );
  }
}
