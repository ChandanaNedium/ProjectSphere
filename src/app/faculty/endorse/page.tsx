"use client"

import { useState, useEffect } from "react"
import { Award, Star, Search, ExternalLink } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import { SAMPLE_PROJECTS, getUploadedProjects, type Project } from "@/lib/projects"

const DOMAIN_COLORS: Record<string, string> = {
  "AI & ML": "#60a5fa", Blockchain: "#c084fc", IoT: "#34d399",
  "Data Science": "#fbbf24", Cybersecurity: "#f87171", Mobile: "#2dd4bf",
  Healthcare: "#fb923c", Education: "#a78bfa", "Web Development": "#38bdf8",
}

const ENDORSED_KEY = "ps_endorsed_projects"

function getEndorsed(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try { return new Set(JSON.parse(localStorage.getItem(ENDORSED_KEY) || "[]")) } catch { return new Set() }
}
function saveEndorsed(set: Set<string>) {
  localStorage.setItem(ENDORSED_KEY, JSON.stringify([...set]))
}

export default function EndorseProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [endorsed, setEndorsed] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState("")
  const [filterEndorsed, setFilterEndorsed] = useState<"all" | "endorsed" | "unendorsed">("all")

  useEffect(() => {
    setProjects([...getUploadedProjects(), ...SAMPLE_PROJECTS])
    setEndorsed(getEndorsed())
  }, [])

  function toggleEndorse(id: string) {
    setEndorsed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      saveEndorsed(next)
      return next
    })
  }

  const filtered = projects.filter(p => {
    const matchQ = p.title.toLowerCase().includes(query.toLowerCase()) || p.domain.toLowerCase().includes(query.toLowerCase())
    const matchF = filterEndorsed === "all" || (filterEndorsed === "endorsed" ? endorsed.has(p.id) : !endorsed.has(p.id))
    return matchQ && matchF
  })

  return (
    <div style={{ minHeight: "100vh", background: "hsl(222,47%,6%)", color: "hsl(210,40%,96%)", fontFamily: "Inter,system-ui,sans-serif", display: "flex" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px", overflowY: "auto", minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(251,191,36,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Award style={{ width: 22, height: 22, color: "#fbbf24" }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>Endorse Projects</h1>
        </div>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 28 }}>
          Officially endorse outstanding student projects to highlight them across the platform.
        </p>

        {/* Endorsed count banner */}
        <div style={{ padding: "16px 20px", borderRadius: 14, background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.15)", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <Award style={{ width: 20, height: 20, color: "#fbbf24" }} />
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
            You have endorsed <b style={{ color: "#fbbf24" }}>{endorsed.size}</b> project{endorsed.size !== 1 ? "s" : ""} so far.
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "0 14px" }}>
            <Search style={{ width: 14, height: 14, color: "rgba(255,255,255,0.35)" }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by title or domain…"
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "white", fontSize: 14, padding: "11px 0" }} />
          </div>
          {(["all","endorsed","unendorsed"] as const).map(k => (
            <button key={k} onClick={() => setFilterEndorsed(k)} style={{
              padding: "10px 16px", borderRadius: 10, border: `1px solid ${filterEndorsed===k ? "#fbbf24" : "rgba(255,255,255,0.1)"}`,
              background: filterEndorsed===k ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.03)",
              color: filterEndorsed===k ? "#fbbf24" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}>{k.charAt(0).toUpperCase()+k.slice(1)}</button>
          ))}
        </div>

        {/* Project grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 18 }}>
          {filtered.map(p => {
            const isEndorsed = endorsed.has(p.id)
            return (
              <div key={p.id} style={{
                padding: "20px", borderRadius: 16, background: "rgba(255,255,255,0.03)",
                border: `1px solid ${isEndorsed ? "rgba(251,191,36,0.35)" : "rgba(255,255,255,0.07)"}`,
                position: "relative", transition: "border-color 0.2s",
              }}>
                {isEndorsed && (
                  <div style={{ position: "absolute", top: 14, right: 14, display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
                    <Award style={{ width: 11, height: 11, color: "#fbbf24" }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24" }}>Endorsed</span>
                  </div>
                )}
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: DOMAIN_COLORS[p.domain] || "#60a5fa", background: `${DOMAIN_COLORS[p.domain] || "#60a5fa"}18`, padding: "3px 9px", borderRadius: 6 }}>{p.domain}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, paddingRight: isEndorsed ? 90 : 0 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 14, lineHeight: 1.5 }}>{p.description.slice(0,110)}…</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{p.college} · {p.year}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#fbbf24" }}>
                    <Star style={{ width: 12, height: 12 }} /> {p.stars}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => toggleEndorse(p.id)} style={{
                    flex: 1, padding: "9px", borderRadius: 9,
                    background: isEndorsed ? "rgba(248,113,113,0.1)" : "rgba(251,191,36,0.12)",
                    border: `1px solid ${isEndorsed ? "rgba(248,113,113,0.25)" : "rgba(251,191,36,0.25)"}`,
                    color: isEndorsed ? "#f87171" : "#fbbf24", fontWeight: 700, fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                    <Award style={{ width: 14, height: 14 }} />
                    {isEndorsed ? "Revoke" : "Endorse"}
                  </button>
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noopener noreferrer" style={{
                      padding: "9px 14px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 13, textDecoration: "none",
                    }}>
                      <ExternalLink style={{ width: 13, height: 13 }} />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 32px", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No projects found.</div>
        )}
      </main>
    </div>
  )
}
