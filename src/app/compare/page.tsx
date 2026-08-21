"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { GitCompare, ArrowLeft, Star, ExternalLink, Check, Plus, Trash2 } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import { getAllProjects, type Project } from "@/lib/projects"

const DOMAIN_COLORS: Record<string, string> = {
  "AI & ML": "#60a5fa", Blockchain: "#c084fc", IoT: "#34d399",
  "Data Science": "#fbbf24", Cybersecurity: "#f87171", Mobile: "#2dd4bf",
  Healthcare: "#fb923c", Education: "#a78bfa", "Web Development": "#38bdf8",
}

function CompareContent() {
  const searchParams = useSearchParams()
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    const projects = getAllProjects()
    setAllProjects(projects)
    const rawIds = searchParams?.get("ids")
    if (rawIds) {
      const ids = rawIds.split(",").filter(id => projects.some(p => p.id === id))
      setSelectedIds(ids.slice(0, 3))
    } else if (projects.length >= 2) {
      setSelectedIds([projects[0].id, projects[1].id])
    }
  }, [searchParams])

  const selectedProjects = selectedIds.map(id => allProjects.find(p => p.id === id)).filter(Boolean) as Project[]

  function addProject(id: string) {
    if (selectedIds.length < 3 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id])
    }
  }

  function removeProject(id: string) {
    setSelectedIds(selectedIds.filter(x => x !== id))
  }

  // Compute similarity matrix / shared tech stack
  const sharedTech = selectedProjects.length >= 2
    ? selectedProjects[0].tech.filter(t => selectedProjects.every(p => p.tech.includes(t)))
    : []

  return (
    <div style={{ minHeight: "100vh", background: "hsl(222,47%,6%)", color: "hsl(210,40%,96%)", fontFamily: "Inter,system-ui,sans-serif", display: "flex" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px", overflowY: "auto", minWidth: 0 }}>
        {/* Navigation */}
        <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.45)", fontSize: 14, fontWeight: 600, textDecoration: "none", marginBottom: 24 }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Explore
        </Link>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GitCompare style={{ width: 22, height: 22, color: "#c084fc" }} />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>Project Comparison</h1>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginTop: 2 }}>
                Side-by-side analysis of technology, domain, and metrics.
              </p>
            </div>
          </div>
          {selectedIds.length < 3 && (
            <select
              onChange={e => { if (e.target.value) addProject(e.target.value); e.target.value = "" }}
              style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 10, color: "#c084fc", padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", outline: "none" }}
            >
              <option value="" style={{ background: "#0d1117" }}>+ Add Project to Compare</option>
              {allProjects.filter(p => !selectedIds.includes(p.id)).map(p => (
                <option key={p.id} value={p.id} style={{ background: "#0d1117" }}>{p.title.slice(0, 45)}…</option>
              ))}
            </select>
          )}
        </div>

        {selectedProjects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", color: "rgba(255,255,255,0.3)" }}>
            Please select projects to compare from the Explore page.
          </div>
        ) : (
          <>
            {/* Shared tech banner */}
            {sharedTech.length > 0 && (
              <div style={{ padding: "14px 20px", borderRadius: 12, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                <Check style={{ width: 18, height: 18, color: "#34d399" }} />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                  Common Tech Stack across selected projects: <strong style={{ color: "#34d399" }}>{sharedTech.join(", ")}</strong>
                </span>
              </div>
            )}

            {/* Comparison Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${selectedProjects.length}, 1fr)`, gap: 20 }}>
              {selectedProjects.map(p => {
                const color = DOMAIN_COLORS[p.domain] || "#60a5fa"
                return (
                  <div key={p.id} style={{ padding: "24px", borderRadius: 18, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>
                    <button onClick={() => removeProject(p.id)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(248,113,113,0.1)", border: "none", color: "#f87171", borderRadius: 6, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>

                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: `${color}20`, color: color, display: "inline-block", marginBottom: 10 }}>{p.domain}</span>
                      <h3 style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.3, marginBottom: 8, paddingRight: 24 }}>{p.title}</h3>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{p.college} · {p.year}</div>
                    </div>

                    <div style={{ padding: "14px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Popularity</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#fbbf24", display: "flex", alignItems: "center", gap: 4 }}>
                        <Star style={{ width: 14, height: 14, fill: "#fbbf24" }} /> {p.stars} Stars
                      </span>
                    </div>

                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Tech Stack</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {p.tech.map(t => (
                          <span key={t} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: sharedTech.includes(t) ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)", color: sharedTech.includes(t) ? "#34d399" : "rgba(255,255,255,0.7)", border: `1px solid ${sharedTech.includes(t) ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.08)"}` }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Authors / Team</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{p.students.join(", ")}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Description</div>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{p.description}</p>
                    </div>

                    <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10 }}>
                      <Link href={`/project/${p.id}`} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#3b82f6", color: "white", fontSize: 13, fontWeight: 700, textAlign: "center", textDecoration: "none" }}>
                        View Details
                      </Link>
                      {p.github && (
                        <a href={p.github} target="_blank" rel="noopener noreferrer" style={{ padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.06)", color: "white", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ExternalLink style={{ width: 14, height: 14 }} />
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "white" }}>Loading comparison…</div>}>
      <CompareContent />
    </Suspense>
  )
}
