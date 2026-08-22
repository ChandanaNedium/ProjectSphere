"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Users, MessageCircle, Star, MapPin, Code, ChevronRight, X, Send, CheckCircle, XCircle, Clock, Search, ShieldCheck, UserCheck, Inbox, SendHorizontal } from "lucide-react"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"
import { getSession, getAllRegisteredUsers, type User } from "@/lib/client-auth"
import type { CollabRequest } from "../faculty/collabs/page"

const COLLAB_KEY = "ps_collab_requests"

function ConnectModal({ person, onClose, onSend }: { person: User; onClose: () => void; onSend: (msg: string) => void }) {
  const [message, setMessage] = useState(`Hi ${person.name.split(' ')[0]}, I came across your profile on ProjectSphere and I'd love to collaborate with you. I'm interested in your work in ${person.interests ? person.interests.split(',')[0].trim() : person.role}. Would you be open to connecting?`)
  const [sending, setSending] = useState(false)

  const handleSend = () => {
    if (!message.trim()) return
    setSending(true)
    setTimeout(() => {
      onSend(message)
    }, 400)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: 520,
        background: 'hsl(222, 47%, 9%)', borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        padding: '28px', fontFamily: 'Inter, system-ui, sans-serif',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: person.role === 'faculty' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, color: 'white', flexShrink: 0,
            }}>
              {person.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
                Connect with {person.name}
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: person.role === 'faculty' ? 'rgba(192,132,252,0.15)' : 'rgba(59,130,246,0.15)', color: person.role === 'faculty' ? '#c084fc' : '#60a5fa', border: `1px solid ${person.role === 'faculty' ? '#c084fc44' : '#60a5fa44'}` }}>
                  {person.role === 'faculty' ? '👨‍🏫 Faculty' : '🎓 Student'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{person.institution} · {person.email}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {person.interests && (
          <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            <span style={{ color: '#2dd4bf', fontWeight: 600 }}>Specialization / Interests:</span> {person.interests}
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}>Your Collaboration Proposal</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, color: 'white', padding: '12px 14px', fontSize: 14,
              outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            style={{
              flex: 2, padding: '11px', borderRadius: 9, background: sending ? 'rgba(45,212,191,0.5)' : '#2dd4bf',
              border: 'none', color: '#0d1117', fontSize: 14, fontWeight: 800, cursor: sending ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}
          >
            {sending ? 'Sending…' : <><Send style={{ width: 15, height: 15 }} />Send Collaboration Request</>}
          </button>
        </div>
      </div>
    </div>
  )
}

function SuccessToast({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 2000,
      background: 'hsl(222, 47%, 10%)', border: '1px solid rgba(52,211,153,0.35)',
      borderRadius: 14, padding: '16px 20px', boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', gap: 12, minWidth: 320,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <CheckCircle style={{ width: 22, height: 22, color: '#34d399', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>Request Sent Real-Time!</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{name} can now view & approve your request in real time.</div>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
        <X style={{ width: 14, height: 14 }} />
      </button>
    </div>
  )
}

function CollaborateContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  const [registeredUsers, setRegisteredUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [connectTarget, setConnectTarget] = useState<User | null>(null)
  const [collabRequests, setCollabRequests] = useState<CollabRequest[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'find' | 'approvals' | 'sent'>(tabParam === 'approvals' ? 'approvals' : 'find')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (tabParam === 'approvals') {
      setActiveTab('approvals')
    }
  }, [tabParam])

  const refreshData = () => {
    if (typeof window === "undefined") return
    const session = getSession()
    setCurrentUser(session)
    setRegisteredUsers(getAllRegisteredUsers())

    try {
      const raw = localStorage.getItem(COLLAB_KEY)
      if (raw) {
        setCollabRequests(JSON.parse(raw))
      } else {
        // Default seed requests so user immediately sees approval workflows
        const seed: CollabRequest[] = [
          { id: "c1", projectTitle: "AI Mental Health Companion", requester: "Anika Sharma", requesterEmail: "anika@iitd.ac.in", targetName: session?.name || "User", college: "IIT Delhi", domain: "AI & ML", message: "Would like to collaborate on the NLP module and extend multilingual support.", status: "pending", date: new Date().toISOString().split('T')[0] },
          { id: "c2", projectTitle: "Blockchain Verification Protocol", requester: "Ravi Kumar", requesterEmail: "ravi@nitt.edu", targetName: session?.name || "User", college: "NIT Surathkal", domain: "Blockchain", message: "Our team has experience with Solidity and wants to add multi-chain support.", status: "pending", date: new Date().toISOString().split('T')[0] },
          { id: "c3", projectTitle: "Smart Energy Dashboard", requester: "Priya Nair", requesterEmail: "priya@bits.edu", targetName: session?.name || "User", college: "BITS Pilani", domain: "IoT", message: "Looking to integrate solar panel monitoring into this system.", status: "approved", date: "2026-08-20" },
        ]
        localStorage.setItem(COLLAB_KEY, JSON.stringify(seed))
        setCollabRequests(seed)
      }
    } catch {
      setCollabRequests([])
    }
  }

  useEffect(() => {
    refreshData()
    window.addEventListener("storage", refreshData)
    return () => window.removeEventListener("storage", refreshData)
  }, [])

  const handleSend = (msg: string) => {
    if (!connectTarget) return
    const session = getSession()
    const requesterName = session?.name || "Student User"
    const requesterCollege = session?.institution || "IIT Bombay"

    const newReq: CollabRequest = {
      id: `c_${Date.now()}`,
      projectTitle: `Collaboration with ${connectTarget.name}`,
      requester: requesterName,
      requesterEmail: session?.email || "student@demo.com",
      targetName: connectTarget.name,
      targetEmail: connectTarget.email,
      college: requesterCollege,
      domain: connectTarget.interests ? connectTarget.interests.split(',')[0].trim() : (connectTarget.role === 'faculty' ? 'Faculty Mentorship' : 'AI & ML'),
      message: msg,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    }

    const updated = [newReq, ...collabRequests]
    localStorage.setItem(COLLAB_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event("storage"))

    setConnectTarget(null)
    setToast(connectTarget.name)
    setTimeout(() => setToast(null), 4000)
  }

  const handleApprovalAction = (id: string, newStatus: 'approved' | 'rejected') => {
    setProcessingId(id)
    setTimeout(() => {
      const updated = collabRequests.map(r => r.id === id ? { ...r, status: newStatus } : r)
      setCollabRequests(updated)
      localStorage.setItem(COLLAB_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event("storage"))
      setProcessingId(null)
    }, 300)
  }

  const filteredUsers = registeredUsers.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.name.toLowerCase().includes(q) ||
      u.institution.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.skills && u.skills.some(s => s.toLowerCase().includes(q))) ||
      (u.interests && u.interests.toLowerCase().includes(q))
    )
  })

  // Pending requests targeted for approvals
  const pendingApprovalsCount = collabRequests.filter(r => r.status === 'pending').length

  const statusMeta = {
    pending:  { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", label: "Pending Approval", icon: Clock },
    approved: { bg: "rgba(52,211,153,0.12)",  color: "#34d399", label: "Approved", icon: CheckCircle },
    rejected: { bg: "rgba(248,113,113,0.12)", color: "#f87171", label: "Rejected", icon: XCircle },
  }

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 6%)', color: 'hsl(210, 40%, 96%)', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(45,212,191,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: 22, height: 22, color: '#2dd4bf' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>ProjectSphere Collaborations</h1>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 2 }}>
                Connect with all registered students & faculty across institutions in real time.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12 }}>
          <button
            onClick={() => setActiveTab('find')}
            style={{
              padding: '10px 18px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
              background: activeTab === 'find' ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.03)',
              color: activeTab === 'find' ? '#2dd4bf' : 'rgba(255,255,255,0.5)',
              border: activeTab === 'find' ? '1px solid rgba(45,212,191,0.3)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Users style={{ width: 16, height: 16 }} />
            Find Collaborators
            <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              {registeredUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            style={{
              padding: '10px 18px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
              background: activeTab === 'approvals' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
              color: activeTab === 'approvals' ? '#818cf8' : 'rgba(255,255,255,0.5)',
              border: activeTab === 'approvals' ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Inbox style={{ width: 16, height: 16 }} />
            Collaboration Approvals
            {pendingApprovalsCount > 0 && (
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#fbbf24', color: '#000', fontWeight: 800 }}>
                {pendingApprovalsCount} pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            style={{
              padding: '10px 18px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
              background: activeTab === 'sent' ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.03)',
              color: activeTab === 'sent' ? '#34d399' : 'rgba(255,255,255,0.5)',
              border: activeTab === 'sent' ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <SendHorizontal style={{ width: 16, height: 16 }} />
            My Sent Requests ({collabRequests.length})
          </button>
        </div>

        {/* TAB 1: FIND COLLABORATORS */}
        {activeTab === 'find' && (
          <>
            {/* Search */}
            <div style={{
              marginBottom: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
            }}>
              <Search style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search registered students and faculty by name, institution, role, or skills…"
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 14, width: '100%', padding: '12px 0' }}
              />
            </div>

            {/* Collaborator grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {filteredUsers.map(u => {
                const isMe = currentUser?.email?.toLowerCase() === u.email.toLowerCase()
                const hasRequested = collabRequests.some(r => r.targetEmail === u.email || r.projectTitle.includes(u.name))
                return (
                  <div key={u.id} style={{
                    borderRadius: 16, background: 'rgba(255,255,255,0.03)',
                    border: isMe ? '1px solid rgba(99,102,241,0.4)' : (hasRequested ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.08)'),
                    padding: '24px', display: 'flex', flexDirection: 'column', gap: 16,
                    position: 'relative',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: u.role === 'faculty' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 800, color: 'white', flexShrink: 0,
                      }}>
                        {u.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {u.name}
                          {isMe && <span style={{ fontSize: 11, background: 'rgba(99,102,241,0.2)', color: '#818cf8', padding: '1px 6px', borderRadius: 6 }}>You</span>}
                        </div>
                        <div style={{ fontSize: 12, color: u.role === 'faculty' ? '#c084fc' : '#60a5fa', fontWeight: 600, marginTop: 2 }}>{u.institution}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {u.role === 'faculty' ? '👨‍🏫 Faculty Member' : '🎓 Student Researcher'}
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
                      {u.bio || `Registered ${u.role} on ProjectSphere from ${u.institution}.`}
                    </p>

                    {u.skills && u.skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {u.skills.map(s => (
                          <span key={s} style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>{s}</span>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {isMe ? (
                        <button disabled style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: 13 }}>
                          Your Account
                        </button>
                      ) : (
                        <button
                          onClick={() => setConnectTarget(u)}
                          style={{
                            width: '100%', padding: '10px', borderRadius: 10,
                            background: hasRequested ? 'rgba(52,211,153,0.12)' : 'rgba(45,212,191,0.12)',
                            border: hasRequested ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(45,212,191,0.3)',
                            color: hasRequested ? '#34d399' : '#2dd4bf', fontWeight: 700, fontSize: 13,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          }}
                        >
                          <Send style={{ width: 14, height: 14 }} />
                          {hasRequested ? 'Send Another Request' : 'Request Collaboration'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* TAB 2: COLLABORATION APPROVALS (Real-time approvals for Student & Faculty) */}
        {activeTab === 'approvals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck style={{ width: 18, height: 18, color: '#818cf8', flexShrink: 0 }} />
              <div>
                <strong>Real-Time Collaboration Approvals:</strong> As a registered student or faculty member, review incoming requests from peers and faculty. Approving or rejecting updates live across all sessions immediately.
              </div>
            </div>

            {collabRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                No collaboration requests received yet.
              </div>
            ) : (
              collabRequests.map(req => {
                const meta = statusMeta[req.status] || statusMeta.pending
                const Icon = meta.icon
                return (
                  <div key={req.id} style={{
                    padding: "22px 26px", borderRadius: 16, background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)", transition: "border-color 0.2s",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: 'white', marginBottom: 6 }}>{req.projectTitle}</div>
                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                          <span>👤 <strong>Requester:</strong> {req.requester}</span>
                          <span>🏛 <strong>College:</strong> {req.college}</span>
                          <span style={{ color: '#60a5fa', fontWeight: 600 }}>🎯 {req.domain}</span>
                          <span>📅 {req.date}</span>
                        </div>
                      </div>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: meta.bg, color: meta.color, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                        <Icon style={{ width: 14, height: 14 }} /> {meta.label}
                      </span>
                    </div>

                    <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 13.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 16 }}>
                      "{req.message}"
                    </div>

                    {req.status === "pending" && (
                      <div style={{ display: "flex", gap: 12 }}>
                        <button
                          onClick={() => handleApprovalAction(req.id, "approved")}
                          disabled={processingId === req.id}
                          style={{
                            padding: "10px 24px", borderRadius: 10, background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.35)",
                            color: "#34d399", fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                          }}
                        >
                          <CheckCircle style={{ width: 16, height: 16 }} />
                          {processingId === req.id ? "Processing…" : "Approve Collaboration"}
                        </button>
                        <button
                          onClick={() => handleApprovalAction(req.id, "rejected")}
                          disabled={processingId === req.id}
                          style={{
                            padding: "10px 24px", borderRadius: 10, background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)",
                            color: "#f87171", fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                          }}
                        >
                          <XCircle style={{ width: 16, height: 16 }} />
                          {processingId === req.id ? "Processing…" : "Reject Collaboration"}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* TAB 3: MY SENT REQUESTS */}
        {activeTab === 'sent' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {collabRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                You haven't sent any collaboration requests yet.
              </div>
            ) : (
              collabRequests.map(req => {
                const meta = statusMeta[req.status] || statusMeta.pending
                const Icon = meta.icon
                return (
                  <div key={req.id} style={{
                    padding: "20px 24px", borderRadius: 16, background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)", display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'white', marginBottom: 4 }}>{req.projectTitle}</div>
                      <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>
                        Sent by {req.requester} · Domain: {req.domain} · Date: {req.date}
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8, fontStyle: 'italic' }}>
                        "{req.message}"
                      </div>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: meta.bg, color: meta.color, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      <Icon style={{ width: 14, height: 14 }} /> {meta.label}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        )}
      </main>

      {connectTarget && (
        <ConnectModal
          person={connectTarget}
          onClose={() => setConnectTarget(null)}
          onSend={handleSend}
        />
      )}

      {toast && <SuccessToast name={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

export default function CollaboratePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 6%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading Collaborations…
      </div>
    }>
      <CollaborateContent />
    </Suspense>
  )
}
