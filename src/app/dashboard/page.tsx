'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  GitCompare, Lightbulb, Users, Bell,
  TrendingUp, Upload, Star, ArrowRight, Shield, ChevronRight,
  Plus, BookOpen, Eye,
} from 'lucide-react'
import { getSession, type User } from '@/lib/client-auth'
import Sidebar from '@/components/Sidebar'
import { getUploadedProjects, type Project } from '@/lib/projects'

const RECOMMENDED = [
  { title: 'Federated Learning for Privacy-Preserving Analytics', college: 'IIT Delhi', domain: 'AI & ML', stars: 88 },
  { title: 'Smart Water Quality Monitoring', college: 'NIT Warangal', domain: 'IoT', stars: 42 },
  { title: 'Natural Language Code Generator', college: 'BITS Goa', domain: 'AI & ML', stars: 76 },
]

const TRENDING = [
  { title: 'Edge AI for Medical Diagnostics', rise: '+142%', domain: 'AI & ML' },
  { title: 'Zero-Knowledge Proof Systems', rise: '+89%', domain: 'Blockchain' },
  { title: 'Digital Twin for Smart Cities', rise: '+67%', domain: 'IoT' },
]

const statusColor: Record<string, string> = {
  published: '#34d399', under_review: '#fbbf24', draft: '#6b7280',
}
const statusLabel: Record<string, string> = {
  published: 'Published', under_review: 'Under Review', draft: 'Draft',
}
const domainColor: Record<string, string> = {
  'AI & ML': '#60a5fa', 'Blockchain': '#c084fc', 'IoT': '#34d399',
  'Data Science': '#fbbf24', 'Cybersecurity': '#f87171',
}

export default function DashboardPage() {
  // Sidebar handles auth redirect — just read session for display
  const [user, setUser] = useState<User | null>(null)
  const [myProjects, setMyProjects] = useState<Project[]>([])

  useEffect(() => {
    const session = getSession()
    if (session) setUser(session)
    setMyProjects(getUploadedProjects())
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 6%)', color: 'hsl(210, 40%, 96%)', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Dashboard</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
              Welcome back, <strong style={{ color: 'white' }}>{user ? user.name.split(' ')[0] : '…'}</strong>! Here&apos;s what&apos;s happening on ProjectSphere.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
              <Bell style={{ width: 18, height: 18 }} />
            </button>
            <Link href="/upload" style={{
              display: 'flex', alignItems: 'center', gap: 6, background: '#3b82f6', color: 'white',
              padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
            }}>
              <Plus style={{ width: 15, height: 15 }} /> Upload Project
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'My Projects', value: String(myProjects.length), icon: BookOpen, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Total Stars', value: String(myProjects.reduce((s, p) => s + p.stars, 0)), icon: Star, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
            { label: 'Profile Views', value: '147', icon: TrendingUp, color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
            { label: 'Collabs Received', value: '5', icon: Users, color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '20px', borderRadius: 14, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon style={{ width: 18, height: 18, color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* My Projects */}
          <div style={{ borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, fontSize: 16 }}>My Projects</h2>
              <Link href="/upload" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>
                <Plus style={{ width: 14, height: 14 }} /> Add
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myProjects.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                  No projects uploaded yet. Upload your first one!
                </div>
              ) : (
                myProjects.slice(0, 5).map(p => (
                  <Link key={p.id} href={`/project/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{p.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${statusColor[p.status]}22`, color: statusColor[p.status] }}>{statusLabel[p.status]}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      <span style={{ color: domainColor[p.domain] || '#60a5fa', fontWeight: 600 }}>{p.domain}</span>
                      <span>⭐ {p.stars}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye style={{ width: 11, height: 11 }} /> View</span>
                    </div>
                  </Link>
                ))
              )}
              <Link href="/upload" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 10, border: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', fontSize: 13, textDecoration: 'none' }}>
                <Plus style={{ width: 14, height: 14 }} /> Upload new project
              </Link>
            </div>
          </div>

          {/* Trending */}
          <div style={{ borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, fontSize: 16 }}>🔥 Trending Topics</h2>
              <Link href="/insights" style={{ fontSize: 13, color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>View all</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {TRENDING.map((t, i) => (
                <div key={t.title} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: 'rgba(255,255,255,0.15)', width: 24, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{t.title}</div>
                    <span style={{ fontSize: 11, color: domainColor[t.domain] || '#60a5fa', fontWeight: 600 }}>{t.domain}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>{t.rise}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended */}
        <div style={{ borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16 }}>✨ Recommended for You</h2>
            <Link href="/explore" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>
              Browse all <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {RECOMMENDED.map(r => (
              <div key={r.title} style={{ padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, marginBottom: 10, background: `${domainColor[r.domain] || '#60a5fa'}22`, color: domainColor[r.domain] || '#60a5fa' }}>{r.domain}</span>
                <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4, marginBottom: 10 }}>{r.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  <span>{r.college}</span>
                  <span style={{ color: '#fbbf24', fontWeight: 600 }}>⭐ {r.stars}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { icon: GitCompare, label: 'Check Similarity', desc: 'Compare with 1,200+ projects', href: '/similarity', color: '#c084fc' },
            { icon: Lightbulb, label: 'Innovation Insights', desc: 'Find unexplored research gaps', href: '/insights', color: '#fbbf24' },
            { icon: Users, label: 'Find Collaborators', desc: 'Connect across institutions', href: '/collaborate', color: '#2dd4bf' },
            { icon: Shield, label: 'Originality Report', desc: 'Full similarity analysis', href: '/reports', color: '#34d399' },
          ].map(a => (
            <Link key={a.label} href={a.href} style={{
              padding: '20px', borderRadius: 14, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none', color: 'inherit',
              display: 'flex', flexDirection: 'column', gap: 10, transition: 'border-color 0.2s',
            }}>
              <a.icon style={{ width: 22, height: 22, color: a.color }} />
              <div style={{ fontWeight: 700, fontSize: 14 }}>{a.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{a.desc}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: a.color, fontWeight: 600, marginTop: 'auto' }}>
                Open <ChevronRight style={{ width: 13, height: 13 }} />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
