import { NextRequest, NextResponse } from "next/server";
import { analyzeGitHubRepository } from "@/lib/github-repository-analyzer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body?.repositoryUrl !== "string" || !body.repositoryUrl.trim()) {
      return NextResponse.json(
        { ok: false, error: "A GitHub repository URL is required." },
        { status: 400 },
      );
    }
    const result = await analyzeGitHubRepository(
      body.repositoryUrl.trim(),
      body.force === true,
    );
    return NextResponse.json(result, { status: result.ok ? 200 : 422 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "GitHub analysis is currently unavailable." },
      { status: 500 },
    );
  }
}
