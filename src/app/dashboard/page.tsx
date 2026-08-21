"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
  GitCompare, Lightbulb, Users, Bell,
  TrendingUp, Upload, Star, ArrowRight, Shield, ChevronRight,
  Plus, BookOpen, Eye, CheckCircle, XCircle, Award
} from "lucide-react"
import { getSession, type User } from "@/lib/client-auth"
import Sidebar from "@/components/Sidebar"
import { getAllProjects, getUploadedProjects, isProjectStarred, toggleStarProject, type Project } from "@/lib/projects"

const RECOMMENDED = [
  { title: "Federated Learning for Privacy-Preserving Analytics", college: "IIT Delhi", domain: "AI & ML", stars: 88 },
  { title: "Smart Water Quality Monitoring", college: "NIT Warangal", domain: "IoT", stars: 42 },
  { title: "Natural Language Code Generator", college: "BITS Goa", domain: "AI & ML", stars: 76 },
]

const TRENDING = [
  { title: "Edge AI for Medical Diagnostics", rise: "+142%", domain: "AI & ML" },
  { title: "Zero-Knowledge Proof Systems", rise: "+89%", domain: "Blockchain" },
  { title: "Digital Twin for Smart Cities", rise: "+67%", domain: "IoT" },
]

const statusColor: Record<string, string> = {
  published: "#34d399", approved: "#34d399", under_review: "#fbbf24", rejected: "#f87171", draft: "#6b7280",
}
const statusLabel: Record<string, string> = {
  published: "Published", approved: "Approved", under_review: "Under Review", rejected: "Rejected", draft: "Draft",
}
const domainColor: Record<string, string> = {
  "AI & ML": "#60a5fa", Blockchain: "#c084fc", IoT: "#34d399",
  "Data Science": "#fbbf24", Cybersecurity: "#f87171",
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [myProjects, setMyProjects] = useState<Project[]>([])
  const [starredMap, setStarredMap] = useState<Record<string, boolean>>({})
  const [endorsedSet, setEndorsedSet] = useState<Set<string>>(new Set())
  const [endorsedBy, setEndorsedBy] = useState<Record<string, string>>({})

  const refreshDashboardData = (currentUser?: User | null) => {
    const session = currentUser !== undefined ? currentUser : getSession()
    if (session) setUser(session)
    const all = getAllProjects()

    // Build starred map
    const map: Record<string, boolean> = {}
    all.forEach(p => { map[p.id] = isProjectStarred(p.id) })
    setStarredMap(map)
    try {
      setEndorsedSet(new Set(JSON.parse(localStorage.getItem('ps_endorsed_projects') || '[]')))
      setEndorsedBy(JSON.parse(localStorage.getItem('ps_endorsed_by') || '{}'))
    } catch {}

    if (session?.role === "faculty") {
      // Faculty Dashboard: Only show projects uploaded by faculty or where faculty is collaborator
      const facultyProjs = all.filter(p => p.uploadedBy === session.email || (p.collaborators && p.collaborators.includes(session.email)))
      setMyProjects(facultyProjs)
    } else {
      // Student Dashboard: Show student uploaded projects
      const uploaded = getUploadedProjects()
      setMyProjects(uploaded)
    }
  }

  useEffect(() => {
    const session = getSession()
    refreshDashboardData(session)

    const handleStorage = () => refreshDashboardData()
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const handleToggleStar = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    toggleStarProject(id)
    refreshDashboardData()
  }

  return (
    <div style={{ minHeight: "100vh", background: "hsl(222, 47%, 6%)", color: "hsl(210, 40%, 96%)", fontFamily: "Inter, system-ui, sans-serif", display: "flex" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "32px", overflowY: "auto", minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>
              {user?.role === "faculty" ? "Faculty Dashboard" : "Dashboard"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
              Welcome back, <strong style={{ color: "white" }}>{user ? user.name : "…"}</strong>! Here&apos;s your platform overview.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
              <Bell style={{ width: 18, height: 18 }} />
            </button>
            <Link href="/upload" style={{
              display: "flex", alignItems: "center", gap: 6, background: "#3b82f6", color: "white",
              padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
            }}>
              <Plus style={{ width: 15, height: 15 }} /> Upload Project
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: user?.role === "faculty" ? "Faculty Projects" : "My Projects", value: String(myProjects.length), icon: BookOpen, color: "#60a5fa", bg: "rgba(59,130,246,0.1)" },
            { label: "Total Stars", value: String(myProjects.reduce((s, p) => s + p.stars, 0)), icon: Star, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
            { label: "Profile Views", value: "147", icon: TrendingUp, color: "#34d399", bg: "rgba(52,211,153,0.1)" },
            { label: "Collabs Received", value: "5", icon: Users, color: "#c084fc", bg: "rgba(192,132,252,0.1)" },
          ].map(s => (
            <div key={s.label} style={{
              padding: "20px", borderRadius: 14, background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: 12,
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon style={{ width: 18, height: 18, color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Faculty Endorsements Panel (students only) ── */}
        {user?.role !== "faculty" && (() => {
          const myEndorsed = myProjects.filter(p => endorsedSet.has(p.id))
          if (myEndorsed.length === 0) return null
          return (
            <div style={{
              marginBottom: 28, borderRadius: 16,
              background: "linear-gradient(135deg, rgba(251,191,36,0.10), rgba(245,158,11,0.06))",
              border: "1.5px solid rgba(251,191,36,0.45)",
              padding: "24px",
            }}>
              {/* Section header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(251,191,36,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Award style={{ width: 21, height: 21, color: "#fbbf24" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#fbbf24" }}>🏅 Your Projects Are Faculty Endorsed!</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                    {myEndorsed.length} of your project{myEndorsed.length > 1 ? "s have" : " has"} been officially endorsed by a faculty member.
                  </div>
                </div>
              </div>

              {/* Endorsed project cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {myEndorsed.map(p => (
                  <Link key={p.id} href={`/project/${p.id}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 18px", borderRadius: 12,
                      background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)",
                      cursor: "pointer", transition: "background 0.15s",
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "white", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "#fbbf24", fontWeight: 700 }}>
                            Endorsed by: {endorsedBy[p.id] || "Faculty"}
                          </span>
                          <span>·</span>
                          <span>{p.domain}</span>
                          <span>·</span>
                          <span>⭐ {p.stars} stars</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 14 }}>
                        <span style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "5px 12px", borderRadius: 6,
                          background: "rgba(251,191,36,0.18)", border: "1px solid rgba(251,191,36,0.35)",
                          fontSize: 11, fontWeight: 800, color: "#fbbf24",
                        }}>
                          <Award style={{ width: 11, height: 11 }} /> Endorsed
                        </span>
                        <ChevronRight style={{ width: 16, height: 16, color: "rgba(255,255,255,0.3)" }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Two columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          {/* My Projects */}
          <div style={{ borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, fontSize: 16 }}>
                {user?.role === "faculty" ? "Faculty Projects & Collaborations" : "My Projects"}
              </h2>
              <Link href="/upload" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>
                <Plus style={{ width: 14, height: 14 }} /> Add
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {myProjects.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                  {user?.role === "faculty"
                    ? "No projects uploaded or collaborated on by you yet."
                    : "No projects uploaded yet. Upload your first one!"}
                </div>
              ) : (
                myProjects.slice(0, 5).map(p => {
                  const isStarred = !!starredMap[p.id]
                  const isProjEndorsed = endorsedSet.has(p.id)
                  const projEndorserName = endorsedBy[p.id] || 'Faculty'
                  return (
                    <div key={p.id} style={{ padding: "14px", borderRadius: 10, background: isProjEndorsed ? "rgba(251,191,36,0.04)" : "rgba(255,255,255,0.03)", border: isProjEndorsed ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(255,255,255,0.06)", display: "block" }}>
                      {isProjEndorsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, fontSize: 11, color: '#fbbf24', fontWeight: 700 }}>
                          <Award style={{ width: 11, height: 11 }} /> Faculty Endorsed by {projEndorserName}
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <Link href={`/project/${p.id}`} style={{ fontSize: 13, fontWeight: 700, textDecoration: "none", color: "white" }}>{p.title}</Link>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: `${statusColor[p.status] || '#6b7280'}22`, color: statusColor[p.status] || '#6b7280' }}>
                          {statusLabel[p.status] || p.status}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                        <span style={{ color: domainColor[p.domain] || "#60a5fa", fontWeight: 600 }}>{p.domain}</span>
                        <button onClick={(e) => handleToggleStar(e, p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: isStarred ? "#fbbf24" : "rgba(255,255,255,0.4)", fontWeight: 700, display: "flex", alignItems: "center", gap: 3, padding: 0 }}>
                          <Star style={{ width: 12, height: 12, fill: isStarred ? "#fbbf24" : "none" }} /> {p.stars}
                        </button>
                        <Link href={`/project/${p.id}`} style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}><Eye style={{ width: 11, height: 11 }} /> View</Link>
                      </div>
                    </div>
                  )
                })
              )}
              <Link href="/upload" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)", fontSize: 13, textDecoration: "none" }}>
                <Plus style={{ width: 14, height: 14 }} /> Upload new project
              </Link>
            </div>
          </div>

          {/* Trending */}
          <div style={{ borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, fontSize: 16 }}>🔥 Trending Topics</h2>
              <Link href="/insights" style={{ fontSize: 13, color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>View all</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {TRENDING.map((t, i) => (
                <div key={t.title} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "rgba(255,255,255,0.15)", width: 24, textAlign: "center", flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{t.title}</div>
                    <span style={{ fontSize: 11, color: domainColor[t.domain] || "#60a5fa", fontWeight: 600 }}>{t.domain}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#34d399" }}>{t.rise}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended */}
        <div style={{ borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", padding: "24px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16 }}>✨ Recommended for You</h2>
            <Link href="/explore" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>
              Browse all <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {RECOMMENDED.map(r => (
              <div key={r.title} style={{ padding: "16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, marginBottom: 10, background: `${domainColor[r.domain] || '#60a5fa'}22`, color: domainColor[r.domain] || '#60a5fa' }}>{r.domain}</span>
                <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4, marginBottom: 10 }}>{r.title}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                  <span>{r.college}</span>
                  <span style={{ color: "#fbbf24", fontWeight: 600 }}>⭐ {r.stars}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { icon: GitCompare, label: "Compare Projects", desc: "Side-by-side technical comparison", href: "/compare", color: "#c084fc" },
            { icon: Lightbulb, label: "Innovation Insights", desc: "Find unexplored research gaps", href: "/insights", color: "#fbbf24" },
            { icon: Users, label: "Find Collaborators", desc: "Connect across institutions", href: "/collaborate", color: "#2dd4bf" },
            { icon: Shield, label: "Originality Report", desc: "Full similarity analysis", href: "/reports", color: "#34d399" },
          ].map(a => (
            <Link key={a.label} href={a.href} style={{
              padding: "20px", borderRadius: 14, background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)", textDecoration: "none", color: "inherit",
              display: "flex", flexDirection: "column", gap: 10, transition: "border-color 0.2s",
            }}>
              <a.icon style={{ width: 22, height: 22, color: a.color }} />
              <div style={{ fontWeight: 700, fontSize: 14 }}>{a.label}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{a.desc}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: a.color, fontWeight: 600, marginTop: "auto" }}>
                Open <ChevronRight style={{ width: 13, height: 13 }} />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
