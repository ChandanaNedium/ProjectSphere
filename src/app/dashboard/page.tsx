'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Network, Home, Search, GitCompare, Lightbulb, Users, BookOpen, Bell,
  TrendingUp, Upload, Star, ArrowRight, Shield, ChevronRight, BarChart2,
  Plus, LogOut
} from 'lucide-react'
import { getSession, logout, type User } from '@/lib/client-auth'

const NAV = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Search, label: 'Explore', href: '/explore' },
  { icon: Upload, label: 'Upload Project', href: '/upload' },
  { icon: GitCompare, label: 'Similarity Check', href: '/similarity' },
  { icon: Lightbulb, label: 'Innovation Insights', href: '/insights' },
  { icon: Users, label: 'Collaborations', href: '/collaborate' },
  { icon: BarChart2, label: 'Analytics', href: '/analytics' },
  { icon: Shield, label: 'Originality Reports', href: '/reports' },
]

const MY_PROJECTS = [
  { title: 'Smart Traffic Flow Optimizer', domain: 'AI & ML', status: 'published', stars: 23, similarity: 34 },
  { title: 'Blockchain Voting System', domain: 'Blockchain', status: 'under_review', stars: 0, similarity: 61 },
]

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

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeNav, setActiveNav] = useState('/dashboard')

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.replace('/login')
    } else {
      setUser(session)
    }
  }, [router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 6%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Checking authentication…</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 6%)', color: 'hsl(210, 40%, 96%)', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', padding: '20px 12px',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 28 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Network style={{ width: 17, height: 17, color: 'white' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px' }}>ProjectSphere</span>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(item => {
            const isActive = activeNav === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setActiveNav(item.href)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                  borderRadius: 8, textDecoration: 'none', fontSize: 13.5, fontWeight: 600,
                  background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                  color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.15s',
                }}
              >
                <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User card */}
        <div style={{
          padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)', marginTop: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: 'white',
            }}>{getInitials(user.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.institution} · {user.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
              padding: '7px', borderRadius: 7, background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <LogOut style={{ width: 13, height: 13 }} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Dashboard</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
              Welcome back, <strong style={{ color: 'white' }}>{user.name.split(' ')[0]}</strong>! Here&apos;s what&apos;s happening on ProjectSphere.
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
            { label: 'My Projects', value: '2', icon: BookOpen, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Total Stars', value: '23', icon: Star, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
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
              {MY_PROJECTS.map(p => (
                <div key={p.title} style={{ padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{p.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${statusColor[p.status]}22`, color: statusColor[p.status] }}>{statusLabel[p.status]}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    <span style={{ color: domainColor[p.domain] || '#60a5fa', fontWeight: 600 }}>{p.domain}</span>
                    <span>⭐ {p.stars}</span>
                    <span style={{ color: p.similarity > 50 ? '#fb923c' : '#34d399' }}>~{p.similarity}% similar</span>
                  </div>
                </div>
              ))}
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
