"use client"

import { useState, useEffect } from "react"
import { BarChart2, TrendingUp, Star, Eye, BookOpen, ArrowUpRight } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import { getAllProjects, type Project } from "@/lib/projects"

interface DomainStat {
  domain: string
  count: number
  totalStars: number
  avgStars: number
  topProject: string
  color: string
}

const DOMAIN_COLORS: Record<string, string> = {
  "AI & ML": "#60a5fa", Blockchain: "#c084fc", IoT: "#34d399",
  "Data Science": "#fbbf24", Cybersecurity: "#f87171", Mobile: "#2dd4bf",
  Healthcare: "#fb923c", Education: "#a78bfa", "Web Development": "#38bdf8",
}

function buildStats(projects: Project[]): DomainStat[] {
  const map: Record<string, Project[]> = {}
  projects.forEach(p => {
    if (!map[p.domain]) map[p.domain] = []
    map[p.domain].push(p)
  })
  return Object.entries(map).map(([domain, projs]) => {
    const totalStars = projs.reduce((s, p) => s + p.stars, 0)
    const top = projs.sort((a, b) => b.stars - a.stars)[0]
    return {
      domain,
      count: projs.length,
      totalStars,
      avgStars: Math.round(totalStars / projs.length),
      topProject: top.title,
      color: DOMAIN_COLORS[domain] || "#60a5fa",
    }
  }).sort((a, b) => b.totalStars - a.totalStars)
}

// Mock monthly activity data per domain
const MONTHLY_LABELS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"]
function mockMonthly(seed: number) {
  return MONTHLY_LABELS.map((m, i) => ({ month: m, value: Math.floor((seed * (i + 1) * 7) % 120 + 10) }))
}

export default function DomainStatsPage() {
  const [stats, setStats] = useState<DomainStat[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const all = getAllProjects()
    setProjects(all)
    setStats(buildStats(all))
  }, [])

  const totalProjects = stats.reduce((s, d) => s + d.count, 0)
  const totalStars = stats.reduce((s, d) => s + d.totalStars, 0)
  const maxCount = Math.max(...stats.map(s => s.count), 1)
  const maxStars = Math.max(...stats.map(s => s.totalStars), 1)

  const selectedStat = stats.find(s => s.domain === selected)
  const selectedProjects = selected ? projects.filter(p => p.domain === selected).sort((a, b) => b.stars - a.stars) : []
  const monthly = selected ? mockMonthly(selected.length) : []

  return (
    <div style={{ minHeight: "100vh", background: "hsl(222,47%,6%)", color: "hsl(210,40%,96%)", fontFamily: "Inter,system-ui,sans-serif", display: "flex" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px", overflowY: "auto", minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BarChart2 style={{ width: 22, height: 22, color: "#818cf8" }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>Domain Statistics</h1>
        </div>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 28 }}>
          Aggregated analytics across all student projects grouped by research domain.
        </p>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 32 }}>
          {[
            { label: "Total Projects", value: totalProjects, icon: BookOpen, color: "#60a5fa" },
            { label: "Total Domains", value: stats.length, icon: BarChart2, color: "#818cf8" },
            { label: "Total Stars", value: totalStars, icon: Star, color: "#fbbf24" },
            { label: "Platform Growth", value: "+24%", icon: TrendingUp, color: "#34d399" },
          ].map(s => (
            <div key={s.label} style={{ padding: "20px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <s.icon style={{ width: 17, height: 17, color: s.color }} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          {/* Projects per domain bar chart */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "24px" }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Projects per Domain</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stats.map(s => (
                <div key={s.domain} style={{ cursor: "pointer" }} onClick={() => setSelected(selected === s.domain ? null : s.domain)}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, color: s.color }}>{s.domain}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>{s.count} projects</span>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(s.count / maxCount) * 100}%`, background: s.color, borderRadius: 4, transition: "width 0.4s" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stars per domain */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "24px" }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Stars per Domain</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stats.map(s => (
                <div key={s.domain} style={{ cursor: "pointer" }} onClick={() => setSelected(selected === s.domain ? null : s.domain)}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, color: s.color }}>{s.domain}</span>
                    <span style={{ color: "#fbbf24", display: "flex", alignItems: "center", gap: 4 }}>
                      <Star style={{ width: 10, height: 10 }} />{s.totalStars}
                    </span>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(s.totalStars / maxStars) * 100}%`, background: "linear-gradient(90deg,#fbbf24,#f59e0b)", borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Domain drilldown */}
        {selected && selectedStat && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${selectedStat.color}33`, borderRadius: 16, padding: "24px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: selectedStat.color }} />
              <h2 style={{ fontWeight: 700, fontSize: 18 }}>{selected} — Deep Dive</h2>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,0.4)", cursor: "pointer" }} onClick={() => setSelected(null)}>✕ Close</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Monthly trend */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "rgba(255,255,255,0.6)" }}>Monthly Activity (Mock)</h3>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
                  {monthly.map(m => {
                    const max = Math.max(...monthly.map(x => x.value))
                    return (
                      <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{m.value}</span>
                        <div style={{ width: "100%", borderRadius: "3px 3px 0 0", background: selectedStat.color, height: `${(m.value / max) * 100}%`, minHeight: 4 }} />
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{m.month}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Top projects */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "rgba(255,255,255,0.6)" }}>Top Projects</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {selectedProjects.slice(0, 4).map(p => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, paddingRight: 12 }}>{p.title}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#fbbf24", whiteSpace: "nowrap" }}>
                        <Star style={{ width: 11, height: 11 }} />{p.stars}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Domain cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {stats.map(s => (
            <div key={s.domain} onClick={() => setSelected(selected === s.domain ? null : s.domain)} style={{
              padding: "20px", borderRadius: 14, cursor: "pointer",
              background: selected === s.domain ? `${s.color}08` : "rgba(255,255,255,0.03)",
              border: `1px solid ${selected === s.domain ? s.color+"44" : "rgba(255,255,255,0.07)"}`,
              transition: "all 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: s.color, background: `${s.color}18`, padding: "4px 10px", borderRadius: 6 }}>{s.domain}</span>
                <ArrowUpRight style={{ width: 14, height: 14, color: "rgba(255,255,255,0.25)" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Projects", value: s.count, icon: BookOpen },
                  { label: "Total Stars", value: s.totalStars, icon: Star },
                  { label: "Avg Stars", value: s.avgStars, icon: Eye },
                ].map(m => (
                  <div key={m.label} style={{ padding: "10px", borderRadius: 9, background: "rgba(255,255,255,0.03)" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 3 }}>{m.value}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                🏆 <span style={{ fontWeight: 600 }}>{s.topProject.slice(0, 35)}{s.topProject.length > 35 ? "…" : ""}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
