"use client"

import { useState, useEffect } from "react"
import { Users, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react"
import Sidebar from "@/components/Sidebar"

export interface CollabRequest {
  id: string
  projectTitle: string
  requester: string
  requesterEmail?: string
  targetName?: string
  targetEmail?: string
  college: string
  domain: string
  message: string
  status: "pending" | "approved" | "rejected"
  date: string
}

const COLLAB_KEY = "ps_collab_requests"

const SEED_COLLABS: CollabRequest[] = [
  { id: "c1", projectTitle: "AI-Powered Mental Health Companion", requester: "Anika Sharma", college: "IIT Delhi", domain: "AI & ML", message: "I would like to collaborate on the NLP module and extend it with multilingual support.", status: "pending", date: "2024-08-14" },
  { id: "c2", projectTitle: "Decentralized Academic Credential Verification", requester: "Ravi Kumar", college: "NIT Surathkal", domain: "Blockchain", message: "Our team has experience with Solidity. We want to add multi-chain support.", status: "pending", date: "2024-08-13" },
  { id: "c3", projectTitle: "Smart Campus Energy Management System", requester: "Priya Nair", college: "BITS Pilani", domain: "IoT", message: "Looking to integrate solar panel monitoring into this system.", status: "approved", date: "2024-08-10" },
  { id: "c4", projectTitle: "Agriculture Yield Prediction Dashboard", requester: "Harish Patel", college: "Amrita University", domain: "Data Science", message: "I can contribute improved satellite imagery models.", status: "rejected", date: "2024-08-09" },
  { id: "c5", projectTitle: "Sign Language to Text Real-Time Translator", requester: "Divya Menon", college: "VIT Chennai", domain: "AI & ML", message: "Want to add Tamil Sign Language support to broaden accessibility.", status: "pending", date: "2024-08-15" },
]

const DOMAIN_COLORS: Record<string, string> = {
  "AI & ML": "#60a5fa", Blockchain: "#c084fc", IoT: "#34d399",
  "Data Science": "#fbbf24", Cybersecurity: "#f87171", Mobile: "#2dd4bf",
}

function loadCollabs(): CollabRequest[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(COLLAB_KEY)
    if (!raw) {
      localStorage.setItem(COLLAB_KEY, JSON.stringify(SEED_COLLABS))
      return SEED_COLLABS
    }
    return JSON.parse(raw)
  } catch { return SEED_COLLABS }
}

function saveCollabs(collabs: CollabRequest[]) {
  localStorage.setItem(COLLAB_KEY, JSON.stringify(collabs))
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"))
  }
}

export default function CollabApprovalsPage() {
  const [collabs, setCollabs] = useState<CollabRequest[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [processing, setProcessing] = useState<string | null>(null)

  const refreshCollabs = () => {
    setCollabs(loadCollabs())
  }

  useEffect(() => {
    refreshCollabs()
    window.addEventListener("storage", refreshCollabs)
    return () => window.removeEventListener("storage", refreshCollabs)
  }, [])

  function handleAction(id: string, action: "approved" | "rejected") {
    setProcessing(id)
    setTimeout(() => {
      setCollabs(prev => {
        const next = prev.map(c => c.id === id ? { ...c, status: action } : c)
        saveCollabs(next)
        return next
      })
      setProcessing(null)
    }, 400)
  }

  function resetAll() {
    saveCollabs(SEED_COLLABS)
    setCollabs(SEED_COLLABS)
  }

  const visible = filter === "all" ? collabs : collabs.filter(c => c.status === filter)
  const counts = {
    all: collabs.length,
    pending: collabs.filter(c => c.status === "pending").length,
    approved: collabs.filter(c => c.status === "approved").length,
    rejected: collabs.filter(c => c.status === "rejected").length,
  }

  const statusMeta = {
    pending:  { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", label: "Pending",  icon: Clock },
    approved: { bg: "rgba(52,211,153,0.12)",  color: "#34d399", label: "Approved", icon: CheckCircle },
    rejected: { bg: "rgba(248,113,113,0.12)", color: "#f87171", label: "Rejected", icon: XCircle },
  }

  return (
    <div style={{ minHeight: "100vh", background: "hsl(222,47%,6%)", color: "hsl(210,40%,96%)", fontFamily: "Inter,system-ui,sans-serif", display: "flex" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px", overflowY: "auto", minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users style={{ width: 22, height: 22, color: "#818cf8" }} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>Collaboration Approvals</h1>
          </div>
          <button onClick={resetAll} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
            <RefreshCw style={{ width: 12, height: 12 }} /> Reset Demo Data
          </button>
        </div>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 28 }}>
          Manage collaboration requests from students who want to join or contribute to existing projects.
        </p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
          {(["all","pending","approved","rejected"] as const).map(k => {
            const cfg = { all:{c:"#818cf8"}, pending:{c:"#fbbf24"}, approved:{c:"#34d399"}, rejected:{c:"#f87171"} }[k]
            return (
              <button key={k} onClick={() => setFilter(k)} style={{
                padding: "16px 20px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                background: filter===k ? `${cfg.c}12` : "rgba(255,255,255,0.03)",
                border: `1px solid ${filter===k ? cfg.c+"55" : "rgba(255,255,255,0.07)"}`,
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: cfg.c, marginBottom: 4 }}>{counts[k]}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{k.charAt(0).toUpperCase()+k.slice(1)}</div>
              </button>
            )
          })}
        </div>

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {visible.map(c => {
            const meta = statusMeta[c.status]
            const Icon = meta.icon
            return (
              <div key={c.id} style={{
                padding: "20px 24px", borderRadius: 16, background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)", transition: "border-color 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{c.projectTitle}</div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                      <span>👤 {c.requester}</span>
                      <span>🏛 {c.college}</span>
                      <span style={{ fontWeight: 700, color: DOMAIN_COLORS[c.domain] || "#60a5fa" }}>{c.domain}</span>
                      <span>📅 {c.date}</span>
                    </div>
                  </div>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 6, background: meta.bg, color: meta.color, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                    <Icon style={{ width: 12, height: 12 }} /> {meta.label}
                  </span>
                </div>
                <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", fontSize: 13, color: "rgba(255,255,255,0.55)", fontStyle: "italic", marginBottom: 14 }}>
                  "{c.message}"
                </div>
                {c.status === "pending" && (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => handleAction(c.id, "approved")} disabled={processing === c.id} style={{
                      padding: "9px 22px", borderRadius: 9, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)",
                      color: "#34d399", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
                    }}>
                      <CheckCircle style={{ width: 14, height: 14 }} />
                      {processing === c.id ? "Processing…" : "Approve"}
                    </button>
                    <button onClick={() => handleAction(c.id, "rejected")} disabled={processing === c.id} style={{
                      padding: "9px 22px", borderRadius: 9, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)",
                      color: "#f87171", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
                    }}>
                      <XCircle style={{ width: 14, height: 14 }} />
                      {processing === c.id ? "Processing…" : "Reject"}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
          {visible.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No requests in this category.</div>
          )}
        </div>
      </main>
    </div>
  )
}
