'use client'

import { useState } from 'react'
import { Users, MessageCircle, Star, MapPin, Code, ChevronRight, X, Send, CheckCircle, Search } from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

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

function ConnectModal({ person, onClose, onSend }: { person: Collaborator; onClose: () => void; onSend: (msg: string) => void }) {
  const [message, setMessage] = useState(`Hi ${person.name.split(' ')[0]}, I came across your profile on ProjectSphere and I'd love to collaborate with you on a project. I'm interested in your work on ${person.interests.split(',')[0].trim()}. Would you be open to a quick chat?`)
  const [sending, setSending] = useState(false)

  const handleSend = () => {
    if (!message.trim()) return
    setSending(true)
    setTimeout(() => {
      onSend(message)
    }, 900)
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
        {/* Header */}
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

        {/* Interests */}
        <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
          <span style={{ color: '#2dd4bf', fontWeight: 600 }}>Interested in:</span> {person.interests}
        </div>

        {/* Message */}
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
            {sending ? (
              <><div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0d1117', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Sending…</>
            ) : (
              <><Send style={{ width: 15, height: 15 }} />Send Request</>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
      fontFamily: 'Inter, system-ui, sans-serif', animation: 'slideUp 0.3s ease',
    }}>
      <CheckCircle style={{ width: 22, height: 22, color: '#34d399', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>Request Sent!</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Your message was sent to {name}.</div>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
        <X style={{ width: 14, height: 14 }} />
      </button>
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  )
}

export default function CollaboratePage() {
  const [connectTarget, setConnectTarget] = useState<Collaborator | null>(null)
  const [sentTo, setSentTo] = useState<string[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const handleSend = (msg: string) => {
    if (!connectTarget) return
    setSentTo(prev => [...prev, connectTarget.id])
    setConnectTarget(null)
    setToast(connectTarget.name)
    setTimeout(() => setToast(null), 4000)
    console.log('Collaboration request to:', connectTarget.name, '\nMessage:', msg)
  }

  const filtered = COLLABORATORS.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.institution.toLowerCase().includes(q) || c.skills.some(s => s.toLowerCase().includes(q)) || c.role.toLowerCase().includes(q)
  })

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
          Find talented students across institutions. Connect, collaborate, and build something amazing together.
        </p>

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
            const alreadySent = sentTo.includes(c.id)
            return (
              <div key={c.id} style={{
                borderRadius: 16, background: 'rgba(255,255,255,0.03)',
                border: alreadySent ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.08)',
                padding: '24px', display: 'flex', flexDirection: 'column', gap: 16,
                transition: 'border-color 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, color: 'white',
                  }}>
                    {c.name.split(' ').map((w: string) => w[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{c.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      <MapPin style={{ width: 11, height: 11 }} />{c.institution}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{c.role}</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, flexShrink: 0,
                    background: c.open ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.06)',
                    color: c.open ? '#34d399' : 'rgba(255,255,255,0.3)',
                    border: `1px solid ${c.open ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.1)'}`,
                  }}>{c.open ? '● Open' : 'Busy'}</span>
                </div>

                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>{c.bio}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {c.skills.slice(0, 4).map((s: string) => (
                    <span key={s} style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>{s}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.35)', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Code style={{ width: 11, height: 11 }} /> {c.projects} projects</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star style={{ width: 11, height: 11 }} /> {c.stars}</span>
                  </div>
                  <button
                    disabled={!c.open}
                    onClick={() => c.open && setConnectTarget(c)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      background: alreadySent ? 'rgba(52,211,153,0.12)' : c.open ? 'rgba(45,212,191,0.12)' : 'rgba(255,255,255,0.04)',
                      color: alreadySent ? '#34d399' : c.open ? '#2dd4bf' : 'rgba(255,255,255,0.25)',
                      border: `1px solid ${alreadySent ? 'rgba(52,211,153,0.3)' : c.open ? 'rgba(45,212,191,0.25)' : 'rgba(255,255,255,0.08)'}`,
                      cursor: c.open && !alreadySent ? 'pointer' : 'not-allowed',
                      transition: 'all 0.15s',
                    }}
                  >
                    {alreadySent ? <><CheckCircle style={{ width: 12, height: 12 }} /> Sent</> : c.open ? <><MessageCircle style={{ width: 12, height: 12 }} /> Connect</> : 'Unavailable'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 32, background: 'linear-gradient(135deg, rgba(45,212,191,0.07), rgba(59,130,246,0.07))',
          border: '1px solid rgba(45,212,191,0.15)', borderRadius: 16, padding: '24px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Want to appear here?</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>Upload a project and mark yourself as open to collaboration.</p>
          </div>
          <Link href="/upload" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#2dd4bf', color: '#0d1117', padding: '11px 20px', borderRadius: 9, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
            Upload Project <ChevronRight style={{ width: 15, height: 15 }} />
          </Link>
        </div>
      </main>

      {/* Connect Modal */}
      {connectTarget && (
        <ConnectModal person={connectTarget} onClose={() => setConnectTarget(null)} onSend={handleSend} />
      )}

      {/* Success Toast */}
      {toast && <SuccessToast name={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
