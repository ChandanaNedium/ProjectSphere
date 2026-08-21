"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  GitCompare,
  ExternalLink,
  Calendar,
  MapPin,
  Users,
  Code,
  BookOpen,
  Shield,
  Tag,
  GitBranch,
  RefreshCw,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { getProjectById, type Project } from "@/lib/projects";

const domainColors: Record<string, string> = {
  "AI & ML": "#60a5fa",
  IoT: "#34d399",
  Blockchain: "#c084fc",
  Cybersecurity: "#f87171",
  "Data Science": "#fbbf24",
  Mobile: "#2dd4bf",
  Healthcare: "#fb923c",
  Education: "#a78bfa",
  "Web Development": "#38bdf8",
  "Green Tech": "#22d3ee",
};

const statusColor: Record<string, string> = {
  published: "#34d399",
  under_review: "#fbbf24",
  draft: "#6b7280",
};
const statusLabel: Record<string, string> = {
  published: "Published",
  under_review: "Under Review",
  draft: "Draft",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [repositoryProfile, setRepositoryProfile] = useState<any>(null);
  const [repositoryError, setRepositoryError] = useState("");
  const [analyzingRepository, setAnalyzingRepository] = useState(false);

  async function analyzeRepository(force = false) {
    if (!project?.github) return;
    setAnalyzingRepository(true);
    setRepositoryError("");
    try {
      const response = await fetch("/api/github/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryUrl: project.github, force }),
      });
      const result = await response.json();
      if (result.ok) setRepositoryProfile(result.profile);
      else setRepositoryError(result.error || "GitHub analysis unavailable.");
    } catch {
      setRepositoryError("GitHub analysis unavailable.");
    } finally {
      setAnalyzingRepository(false);
    }
  }

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;
    const p = getProjectById(id);
    if (p) {
      setProject(p);
    } else {
      setNotFound(true);
    }
  }, [params]);

  const color = project ? domainColors[project.domain] || "#60a5fa" : "#60a5fa";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "hsl(222, 47%, 6%)",
        color: "hsl(210, 40%, 96%)",
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
      }}
    >
      <Sidebar />

      <main
        style={{ flex: 1, padding: "32px", overflowY: "auto", minWidth: 0 }}
      >
        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.45)",
            fontSize: 14,
            cursor: "pointer",
            padding: 0,
            marginBottom: 24,
            fontWeight: 600,
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back
        </button>

        {notFound ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <BookOpen
              style={{
                width: 56,
                height: 56,
                color: "rgba(255,255,255,0.15)",
                margin: "0 auto 20px",
              }}
            />
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
              Project Not Found
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 15,
                marginBottom: 24,
              }}
            >
              This project may have been removed or the link is incorrect.
            </p>
            <Link
              href="/explore"
              style={{
                padding: "10px 20px",
                borderRadius: 9,
                background: "#3b82f6",
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Browse Projects
            </Link>
          </div>
        ) : !project ? (
          <div
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: 15,
              padding: "60px 0",
              textAlign: "center",
            }}
          >
            Loading…
          </div>
        ) : (
          <div style={{ maxWidth: 900 }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    background: `${color}22`,
                    color: color,
                  }}
                >
                  {project.domain}
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    background: `${statusColor[project.status]}18`,
                    color: statusColor[project.status],
                    border: `1px solid ${statusColor[project.status]}30`,
                  }}
                >
                  {statusLabel[project.status]}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.3)",
                    fontWeight: 600,
                  }}
                >
                  {project.type}
                </span>
              </div>

              <h1
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  letterSpacing: "-0.5px",
                  lineHeight: 1.3,
                  marginBottom: 16,
                }}
              >
                {project.title}
              </h1>

              {/* Meta row */}
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  flexWrap: "wrap",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin style={{ width: 14, height: 14 }} /> {project.college}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar style={{ width: 14, height: 14 }} /> {project.year}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Users style={{ width: 14, height: 14 }} />{" "}
                  {project.students.join(", ")}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#fbbf24",
                  }}
                >
                  <Star style={{ width: 14, height: 14, fill: "#fbbf24" }} />{" "}
                  {project.stars}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
              <Link
                href={`/similarity?ref=${project.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 18px",
                  borderRadius: 9,
                  background: "rgba(139,92,246,0.12)",
                  color: "#c084fc",
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid rgba(139,92,246,0.25)",
                }}
              >
                <GitCompare style={{ width: 15, height: 15 }} /> Check
                Similarity
              </Link>
              {project.github && (
                <>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 18px",
                      borderRadius: 9,
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      fontWeight: 700,
                      textDecoration: "none",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <ExternalLink style={{ width: 15, height: 15 }} /> GitHub
                  </a>
                  <button
                    onClick={() =>
                      analyzeRepository(Boolean(repositoryProfile))
                    }
                    disabled={analyzingRepository}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 18px",
                      borderRadius: 9,
                      background: "rgba(59,130,246,0.1)",
                      color: "#93c5fd",
                      fontSize: 13,
                      fontWeight: 700,
                      border: "1px solid rgba(59,130,246,0.25)",
                      cursor: analyzingRepository ? "wait" : "pointer",
                    }}
                  >
                    {analyzingRepository ? (
                      <RefreshCw
                        style={{
                          width: 15,
                          height: 15,
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    ) : (
                      <GitBranch style={{ width: 15, height: 15 }} />
                    )}
                    {repositoryProfile
                      ? "Re-analyze Repository"
                      : "Analyze Repository"}
                  </button>
                </>
              )}
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 18px",
                  borderRadius: 9,
                  background: "rgba(251,191,36,0.1)",
                  color: "#fbbf24",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1px solid rgba(251,191,36,0.25)",
                }}
              >
                <Star style={{ width: 15, height: 15 }} /> Star Project
              </button>
            </div>

            {/* Main content grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 300px",
                gap: 24,
              }}
            >
              {/* Left — description */}
              <div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16,
                    padding: "28px",
                  }}
                >
                  <h2
                    style={{
                      fontWeight: 700,
                      fontSize: 17,
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <BookOpen style={{ width: 18, height: 18, color }} />{" "}
                    Project Description
                  </h2>
                  <div
                    style={{
                      fontSize: 15,
                      color: "rgba(255,255,255,0.65)",
                      lineHeight: 1.8,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {project.description}
                  </div>
                </div>

                {/* Uploaded date if user-uploaded */}
                {repositoryError && (
                  <div
                    style={{ marginTop: 16, color: "#fca5a5", fontSize: 13 }}
                  >
                    {repositoryError}
                  </div>
                )}
                {repositoryProfile && (
                  <div
                    style={{
                      marginTop: 16,
                      background: "rgba(59,130,246,0.06)",
                      border: "1px solid rgba(59,130,246,0.15)",
                      borderRadius: 12,
                      padding: "16px 18px",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.65)",
                      lineHeight: 1.7,
                    }}
                  >
                    <strong style={{ color: "white" }}>
                      Repository Analysis Available
                    </strong>
                    <br />
                    Languages:{" "}
                    {repositoryProfile.languages.join(", ") || "Not detected"}
                    <br />
                    Frameworks:{" "}
                    {repositoryProfile.frameworks.join(", ") || "Not detected"}
                    <br />
                    Architecture:{" "}
                    {repositoryProfile.architecture.join(", ") ||
                      "Not detected"}
                    <br />
                    Analyzed:{" "}
                    {new Date(repositoryProfile.analyzedAt).toLocaleString()}
                  </div>
                )}
                {project.uploadedAt && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: "14px 18px",
                      borderRadius: 12,
                      background: "rgba(59,130,246,0.05)",
                      border: "1px solid rgba(59,130,246,0.15)",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    📅 Uploaded on{" "}
                    {new Date(project.uploadedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {project.uploadedBy && (
                      <span> by {project.uploadedBy}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Right — sidebar info */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {/* Tech stack */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    padding: "20px",
                  }}
                >
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      marginBottom: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Code style={{ width: 15, height: 15, color: "#60a5fa" }} />{" "}
                    Technology Stack
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 7,
                          fontSize: 12,
                          fontWeight: 600,
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.6)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Project info */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    padding: "20px",
                  }}
                >
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      marginBottom: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Tag style={{ width: 15, height: 15, color: "#34d399" }} />{" "}
                    Details
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      fontSize: 13,
                    }}
                  >
                    {[
                      { label: "Domain", value: project.domain },
                      { label: "Type", value: project.type },
                      { label: "Year", value: String(project.year) },
                      { label: "Institution", value: project.college },
                      { label: "Team", value: project.students.join(", ") },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ color: "rgba(255,255,255,0.4)" }}>
                          {item.label}
                        </span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "rgba(255,255,255,0.7)",
                            textAlign: "right",
                            maxWidth: 160,
                          }}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Similarity CTA */}
                <Link
                  href={`/similarity?ref=${project.id}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: "20px",
                    borderRadius: 14,
                    textDecoration: "none",
                    background:
                      "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))",
                    border: "1px solid rgba(139,92,246,0.2)",
                  }}
                >
                  <Shield style={{ width: 22, height: 22, color: "#c084fc" }} />
                  <div
                    style={{ fontWeight: 700, fontSize: 14, color: "white" }}
                  >
                    Run Originality Check
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.4)",
                      lineHeight: 1.5,
                    }}
                  >
                    Compare this project against 1,200+ others to find
                    similarities.
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
