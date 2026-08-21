"use client"

import { useState, useEffect } from "react"
import { Users, MessageCircle, Star, MapPin, Code, ChevronRight, X, Send, CheckCircle, XCircle, Clock, Search } from "lucide-react"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"
import { getSession } from "@/lib/client-auth"
import type { CollabRequest } from "../faculty/collabs/page"

const COLLABORATORS = [
  {
    id: '1', name: 'Arjun Verma', institution: 'IIT Bombay', role: 'BTech · AI & ML',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision'],
    projects: 3, stars: 89, open: true,
    bio: 'Passionate about building AI systems that solve real-world problems. Looking for collaborators in NLP and robotics.',
    interests: 'NLP, Computer Vision, Robotics, Healthcare AI',
    email: 'arjun.verma@iitb.ac.in',
  },
  {
    id: '2', name: 'Sanya Gupta', institution: 'BITS Pilani', role: 'MTech · Data Science',
    skills: ['R', 'Python', 'SQL', 'Tableau', 'Statistics'],
    projects: 5, stars: 124, open: true,
    bio: 'Data scientist focused on healthcare analytics. Open to interdisciplinary collaborations.',
    interests: 'Healthcare Analytics, Clinical ML, Bioinformatics',
    email: 'sanya.gupta@bits-pilani.ac.in',
  },
  {
    id: '3', name: 'Kiran Rao', institution: 'NIT Trichy', role: 'BTech · Blockchain',
    skills: ['Solidity', 'Web3.js', 'Ethereum', 'IPFS', 'Rust'],
    projects: 2, stars: 63, open: false,
    bio: 'Building decentralized systems for education and supply chain. Currently busy with thesis.',
    interests: 'DeFi, NFTs, Smart Contracts, DAO Governance',
    email: 'kiran.rao@nitt.edu',
  },
  {
    id: '4', name: 'Meera Nair', institution: 'IIIT Hyderabad', role: 'PhD · HCI',
    skills: ['React', 'Figma', 'User Research', 'Accessibility', 'D3.js'],
    projects: 4, stars: 97, open: true,
    bio: 'Designing interfaces that are inclusive and delightful. Interested in AI-assisted UX tools.',
    interests: 'Inclusive Design, Voice UI, AI-driven UX, Affective Computing',
    email: 'meera.nair@iiit.ac.in',
  },
  {
    id: '5', name: 'Vikram Reddy', institution: 'IIT Madras', role: 'BTech · Cybersecurity',
    skills: ['Penetration Testing', 'Go', 'Docker', 'Kubernetes', 'CTF'],
    projects: 6, stars: 145, open: true,
    bio: 'Security researcher with multiple CVEs. Love building tools for the security community.',
    interests: 'Zero-day research, Malware analysis, Secure systems, CTF',
    email: 'vikram.reddy@iitm.ac.in',
  },
  {
    id: '6', name: 'Lakshmi Nair', institution: 'Amrita University', role: 'BTech · EdTech',
    skills: ['Flutter', 'Firebase', 'Node.js', 'Gamification', 'MongoDB'],
    projects: 2, stars: 71, open: true,
    bio: 'Building the next generation of adaptive learning tools. Open to partnerships with NGOs.',
    interests: 'EdTech, Gamification, Adaptive Learning, Social Impact',
    email: 'lakshmi.nair@amrita.edu',
  },
]

type Collaborator = typeof COLLABORATORS[0]

const COLLAB_KEY = "ps_collab_requests"

function ConnectModal({ person, onClose, onSend }: { person: Collaborator; onClose: () => void; onSend: (msg: string) => void }) {
  const [message, setMessage] = useState(`Hi ${person.name.split(' ')[0]}, I came across your profile on ProjectSphere and I'd love to collaborate with you on a project. I'm interested in your work on ${person.interests.split(',')[0].trim()}. Would you be open to a quick chat?`)
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
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
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
              width: 42, height: 42, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 800, color: 'white', flexShrink: 0,
            }}>
              {person.name.split(' ').map(w => w[0]).join('')}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'white' }}>Connect with {person.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{person.institution} · {person.role}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
          <span style={{ color: '#2dd4bf', fontWeight: 600 }}>Interested in:</span> {person.interests}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}>Your Message</label>
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
            {sending ? 'Sending…' : <><Send style={{ width: 15, height: 15 }} />Send Request</>}
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
      display: 'flex', alignItems: 'center', gap: 12, minWidth: 300,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <CheckCircle style={{ width: 22, height: 22, color: '#34d399', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>Request Sent!</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Your message was sent to {name}.</div>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
        <X style={{ width: 14, height: 14 }} />
      </button>
    </div>
  )
}

export default function CollaboratePage() {
  const [connectTarget, setConnectTarget] = useState<Collaborator | null>(null)
  const [collabRequests, setCollabRequests] = useState<CollabRequest[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const refreshCollabRequests = () => {
    if (typeof window === "undefined") return
    try {
      const raw = localStorage.getItem(COLLAB_KEY) || "[]"
      setCollabRequests(JSON.parse(raw))
    } catch { setCollabRequests([]) }
  }

  useEffect(() => {
    refreshCollabRequests()
    window.addEventListener("storage", refreshCollabRequests)
    return () => window.removeEventListener("storage", refreshCollabRequests)
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
      college: requesterCollege,
      domain: connectTarget.interests.split(',')[0].trim() || 'AI & ML',
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

  const filtered = COLLABORATORS.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.institution.toLowerCase().includes(q) || c.skills.some(s => s.toLowerCase().includes(q)) || c.role.toLowerCase().includes(q)
  })

  const statusMeta = {
    pending:  { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", label: "Pending Faculty Review", icon: Clock },
    approved: { bg: "rgba(52,211,153,0.12)",  color: "#34d399", label: "Approved", icon: CheckCircle },
    rejected: { bg: "rgba(248,113,113,0.12)", color: "#f87171", label: "Rejected", icon: XCircle },
  }

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 6%)', color: 'hsl(210, 40%, 96%)', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(45,212,191,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users style={{ width: 22, height: 22, color: '#2dd4bf' }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>Collaborations</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 28 }}>
          Find talented students & researchers across institutions. Connect, request collaboration, and manage live approval statuses.
        </p>

        {/* Live Collab Requests Status Section */}
        {collabRequests.length > 0 && (
          <div style={{ marginBottom: 32, padding: '24px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚡ My Collaboration Requests & Live Statuses
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {collabRequests.slice(0, 4).map(req => {
                const meta = statusMeta[req.status] || statusMeta.pending
                const Icon = meta.icon
                return (
                  <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{req.projectTitle}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Submitted by {req.requester} · {req.domain} · {req.date}</div>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 6, background: meta.bg, color: meta.color, fontSize: 12, fontWeight: 700 }}>
                      <Icon style={{ width: 13, height: 13 }} /> {meta.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Active Collaborators', value: '2,400+', color: '#2dd4bf' },
            { label: 'Institutions', value: '50+', color: '#60a5fa' },
            { label: 'Successful Collabs', value: '340+', color: '#34d399' },
          ].map(s => (
            <div key={s.label} style={{ padding: '18px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{
          marginBottom: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
        }}>
          <Search style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, institution, or skill…"
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 14, width: '100%', padding: '12px 0' }}
          />
        </div>

        {/* Collaborator grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {filtered.map(c => {
            const hasRequested = collabRequests.some(r => r.projectTitle.includes(c.name))
            return (
              <div key={c.id} style={{
                borderRadius: 16, background: 'rgba(255,255,255,0.03)',
                border: hasRequested ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.08)',
                padding: '24px', display: 'flex', flexDirection: 'column', gap: 16,
                transition: 'border-color 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, color: 'white', flexShrink: 0,
                  }}>
                    {c.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600, marginTop: 2 }}>{c.institution}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{c.role}</div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>{c.bio}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {c.skills.map(s => (
                    <span key={s} style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>{s}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  <span>{c.projects} Projects</span>
                  <span style={{ color: '#fbbf24', fontWeight: 600 }}>⭐ {c.stars} Stars</span>
                </div>

                <button
                  onClick={() => setConnectTarget(c)}
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
              </div>
            )
          })}
        </div>
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
