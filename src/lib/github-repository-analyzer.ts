import {
  getEnvConfig,
  GLOBAL_SIMILARITY_CONFIG,
} from "@/lib/global-similarity/config";

export interface RepositoryImplementationProfile {
  repositoryUrl: string;
  repositoryName: string;
  owner: string;
  description: string;
  topics: string[];
  stars: number;
  forks: number;
  primaryLanguage?: string;
  languages: string[];
  defaultBranch: string;
  repositoryUpdatedAt?: string;
  architecture: string[];
  frameworks: string[];
  libraries: string[];
  databases: string[];
  aiMlTechnologies: string[];
  importantFiles: string[];
  keyModules: string[];
  features: string[];
  implementationConcepts: string[];
  documentationSummary: string;
  projectPurpose: string;
  analyzedAt: string;
  analyzedCommitSha?: string;
  profileText: string;
}

export interface RepositoryAnalysisResult {
  ok: boolean;
  profile?: RepositoryImplementationProfile;
  error?: string;
  code?:
    | "INVALID_URL"
    | "NOT_FOUND"
    | "PRIVATE"
    | "RATE_LIMITED"
    | "UNAVAILABLE"
    | "EMPTY"
    | "TOO_LARGE";
}

interface GitHubFile {
  path: string;
  size?: number;
  type?: string;
}

interface GitHubRepositoryData {
  name: string
  owner?: { login?: string }
  description?: string | null
  topics?: string[]
  stargazers_count?: number
  forks_count?: number
  language?: string | null
  default_branch: string
  updated_at?: string
  pushed_at?: string
  private?: boolean
}

const cache = new Map<
  string,
  { expiresAt: number; result: RepositoryAnalysisResult }
>();
const SKIP_PARTS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  "vendor",
]);
const IMPORTANT_FILES =
  /(^|\/)(readme(?:\.[^/]+)?|package\.json|requirements\.txt|pyproject\.toml|pom\.xml|build\.gradle|prisma\.schema|docker-compose\.ya?ml|tsconfig\.json|next\.config\.[^/]+)$/i;
const SOURCE_EXTENSIONS = /\.(ts|tsx|js|jsx|py|java|kt|go|rs|rb|php|cs|sql)$/i;

function parseGitHubUrl(
  value: string,
): { owner: string; repo: string; url: string } | null {
  try {
    const parsed = new URL(value.trim());
    if (
      parsed.protocol !== "https:" ||
      parsed.hostname.toLowerCase() !== "github.com"
    )
      return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (
      parts.length !== 2 ||
      !/^[a-z0-9_.-]+$/i.test(parts[0]) ||
      !/^[a-z0-9_.-]+$/i.test(parts[1])
    )
      return null;
    const repo = parts[1].replace(/\.git$/i, "");
    if (!repo) return null;
    return {
      owner: parts[0],
      repo,
      url: `https://github.com/${parts[0]}/${repo}`,
    };
  } catch {
    return null;
  }
}

async function githubFetch<T>(
  path: string,
  headers: Record<string, string>,
): Promise<{ response: Response; data: T | null }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    GLOBAL_SIMILARITY_CONFIG.API_TIMEOUT_MS,
  );
  try {
    const response = await fetch(`https://api.github.com${path}`, {
      headers,
      signal: controller.signal,
    });
    const data = response.ok ? ((await response.json()) as T) : null;
    return { response, data };
  } finally {
    clearTimeout(timeoutId);
  }
}

function unique(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  );
}

function detectTechnologies(
  files: Array<{ path: string; content: string }>,
  languages: string[],
) {
  const text = files
    .map((file) => file.content)
    .join("\n")
    .toLowerCase();
  const frameworks: string[] = [];
  const libraries: string[] = [];
  const databases: string[] = [];
  const aiMlTechnologies: string[] = [];
  const add = (target: string[], name: string, patterns: RegExp[]) => {
    if (patterns.some((pattern) => pattern.test(text))) target.push(name);
  };
  add(frameworks, "Next.js", [/next["']\s*:/, /from ["']next\//]);
  add(frameworks, "React", [/react["']\s*:/, /from ["']react["']/]);
  add(frameworks, "Express", [/express["']\s*:/, /require\(["']express/]);
  add(frameworks, "FastAPI", [/fastapi/]);
  add(frameworks, "Flask", [/flask/]);
  add(frameworks, "Django", [/django/]);
  add(libraries, "Prisma", [/prisma/]);
  add(libraries, "TensorFlow", [/tensorflow/]);
  add(libraries, "PyTorch", [/torch/]);
  add(libraries, "OpenCV", [/opencv|cv2/]);
  add(libraries, "Tailwind CSS", [/tailwind/]);
  add(databases, "PostgreSQL", [/postgres|postgresql/]);
  add(databases, "MongoDB", [/mongodb|mongoose/]);
  add(databases, "SQLite", [/sqlite/]);
  add(databases, "MySQL", [/mysql/]);
  add(aiMlTechnologies, "OpenAI", [/openai/]);
  add(aiMlTechnologies, "Hugging Face", [/huggingface|transformers/]);
  add(aiMlTechnologies, "scikit-learn", [/sklearn|scikit-learn/]);
  return {
    languages: unique(languages),
    frameworks: unique(frameworks),
    libraries: unique(libraries),
    databases: unique(databases),
    aiMlTechnologies: unique(aiMlTechnologies),
  };
}

function selectFiles(tree: GitHubFile[]): GitHubFile[] {
  return tree
    .filter(
      (file) =>
        file.type === "blob" &&
        file.path.split("/").every((part) => !SKIP_PARTS.has(part)),
    )
    .filter(
      (file) =>
        IMPORTANT_FILES.test(file.path) || SOURCE_EXTENSIONS.test(file.path),
    )
    .sort(
      (a, b) =>
        Number(IMPORTANT_FILES.test(b.path)) -
        Number(IMPORTANT_FILES.test(a.path)),
    )
    .slice(0, GLOBAL_SIMILARITY_CONFIG.MAX_REPOSITORY_FILES);
}

export async function analyzeGitHubRepository(
  repositoryUrl: string,
  force = false,
): Promise<RepositoryAnalysisResult> {
  const parsed = parseGitHubUrl(repositoryUrl);
  if (!parsed)
    return {
      ok: false,
      code: "INVALID_URL",
      error:
        "Enter a public GitHub repository URL such as https://github.com/owner/repository.",
    };
  const cached = cache.get(parsed.url);
  if (!force && cached && cached.expiresAt > Date.now()) return cached.result;

  const env = getEnvConfig();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ProjectSphere-Repository-Analyzer/1.0",
    ...(env.githubToken ? { Authorization: `Bearer ${env.githubToken}` } : {}),
  };

  try {
    const repoResult = await githubFetch<GitHubRepositoryData>(
      `/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`,
      headers,
    );
    if (repoResult.response.status === 404)
      return {
        ok: false,
        code: "NOT_FOUND",
        error: "The GitHub repository was not found or is private.",
      };
    if (
      repoResult.response.status === 403 ||
      repoResult.response.status === 429
    )
      return {
        ok: false,
        code: "RATE_LIMITED",
        error: "GitHub API rate limit reached. Try again later.",
      };
    if (!repoResult.response.ok || !repoResult.data)
      return {
        ok: false,
        code: "UNAVAILABLE",
        error: `GitHub returned status ${repoResult.response.status}.`,
      };
    if (repoResult.data.private)
      return {
        ok: false,
        code: "PRIVATE",
        error: "Private repositories are not currently supported.",
      };

    const [languagesResult, treeResult] = await Promise.all([
      githubFetch<Record<string, number>>(
        `/repos/${parsed.owner}/${parsed.repo}/languages`,
        headers,
      ),
      githubFetch<{ tree?: GitHubFile[] }>(
        `/repos/${parsed.owner}/${parsed.repo}/git/trees/${encodeURIComponent(repoResult.data.default_branch)}?recursive=1`,
        headers,
      ),
    ]);
    if (
      treeResult.response.status === 403 ||
      languagesResult.response.status === 403
    )
      return {
        ok: false,
        code: "RATE_LIMITED",
        error: "GitHub API rate limit reached while reading repository files.",
      };
    const tree = treeResult.data?.tree || [];
    if (tree.length === 0)
      return {
        ok: false,
        code: "EMPTY",
        error: "The repository is empty or has no accessible files.",
      };

    const selected = selectFiles(tree);
    const files: Array<{ path: string; content: string }> = [];
    for (const file of selected) {
      if ((file.size || 0) > GLOBAL_SIMILARITY_CONFIG.MAX_REPOSITORY_FILE_SIZE)
        continue;
      try {
        const result = await githubFetch<{
          content?: string;
          encoding?: string;
        }>(
          `/repos/${parsed.owner}/${parsed.repo}/contents/${file.path}?ref=${encodeURIComponent(repoResult.data.default_branch)}`,
          headers,
        );
        if (result.response.ok && result.data?.content) {
          const encoding = result.data.encoding === "utf-8" ? "utf8" : "base64";
          files.push({
            path: file.path,
            content: Buffer.from(result.data.content, encoding)
              .toString("utf8")
              .slice(0, GLOBAL_SIMILARITY_CONFIG.MAX_REPOSITORY_FILE_SIZE),
          });
        }
      } catch {
        /* One unreadable file should not block the profile. */
      }
    }

    const technology = detectTechnologies(
      files,
      Object.keys(languagesResult.data || {}),
    );
    const readme =
      files.find((file) => /(^|\/)readme/i.test(file.path))?.content || "";
    const directories = unique(
      tree
        .map((file) => file.path.split("/")[0])
        .filter((name) => name && !name.includes(".")),
    );
    const importantFiles = selected
      .filter((file) => IMPORTANT_FILES.test(file.path))
      .map((file) => file.path);
    const keyModules = selected
      .filter((file) => SOURCE_EXTENSIONS.test(file.path))
      .map((file) => file.path)
      .slice(0, 12);
    const architecture = directories.filter((directory) =>
      /app|src|pages|components|api|backend|server|models|services|routes|database|prisma|notebooks|public/i.test(
        directory,
      ),
    );
    const features = unique(
      readme
        .split(/[.!?\n]/)
        .map((line) => line.replace(/^[-*#\s]+/, "").trim())
        .filter((line) => line.length > 20),
    ).slice(0, 8);
    const implementationConcepts = unique([
      ...technology.frameworks,
      ...technology.libraries,
      ...technology.databases,
      ...architecture,
      ...keyModules.map((path) => path.split("/").slice(-2, -1)[0] || path),
    ]);
    const profileText = [
      `Purpose: ${repoResult.data.description || readme.slice(0, 400)}`,
      `Languages: ${technology.languages.join(", ")}`,
      `Frameworks: ${technology.frameworks.join(", ")}`,
      `Libraries: ${technology.libraries.join(", ")}`,
      `Databases: ${technology.databases.join(", ")}`,
      `Architecture: ${architecture.join(", ")}`,
      `Modules: ${keyModules.join(", ")}`,
      `Implementation concepts: ${implementationConcepts.join(", ")}`,
      `Documentation: ${readme.slice(0, 1200)}`,
    ].join("\n");
    const profile: RepositoryImplementationProfile = {
      repositoryUrl: parsed.url,
      repositoryName: repoResult.data.name,
      owner: repoResult.data.owner?.login || parsed.owner,
      description: repoResult.data.description || "",
      topics: repoResult.data.topics || [],
      stars: repoResult.data.stargazers_count || 0,
      forks: repoResult.data.forks_count || 0,
      primaryLanguage: repoResult.data.language || undefined,
      languages: technology.languages,
      defaultBranch: repoResult.data.default_branch,
      repositoryUpdatedAt: repoResult.data.updated_at,
      architecture,
      frameworks: technology.frameworks,
      libraries: technology.libraries,
      databases: technology.databases,
      aiMlTechnologies: technology.aiMlTechnologies,
      importantFiles,
      keyModules,
      features,
      implementationConcepts,
      documentationSummary: readme.slice(0, 1600),
      projectPurpose:
        repoResult.data.description || readme.split(/[.!?]/)[0] || "",
      analyzedAt: new Date().toISOString(),
      analyzedCommitSha: repoResult.data.pushed_at,
      profileText,
    };
    const result = { ok: true, profile } as RepositoryAnalysisResult;
    cache.set(parsed.url, {
      result,
      expiresAt: Date.now() + GLOBAL_SIMILARITY_CONFIG.REPOSITORY_CACHE_TTL_MS,
    });
    return result;
  } catch (error: unknown) {
    const errorName = error instanceof Error ? error.name : ''
    const result = {
      ok: false,
      code: "UNAVAILABLE" as const,
      error:
        errorName === "AbortError"
          ? "GitHub request timed out."
          : "GitHub analysis is currently unavailable.",
    };
    return result;
  }
}

export function validateGitHubRepositoryUrl(value: string): boolean {
  return parseGitHubUrl(value) !== null;
}
