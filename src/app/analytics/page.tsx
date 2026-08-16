'use client'

import { useState, useEffect } from 'react'
import { BarChart2, Eye, Star, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { getUploadedProjects, type Project } from '@/lib/projects'

const MONTHLY = [
  { month: 'Mar', views: 12 },
  { month: 'Apr', views: 28 },
  { month: 'May', views: 45 },
  { month: 'Jun', views: 62 },
  { month: 'Jul', views: 98 },
  { month: 'Aug', views: 147 },
]

const REFERRERS = [
  { source: 'Direct Search', visits: 68, pct: 46 },
  { source: 'Explore Page', visits: 43, pct: 29 },
  { source: 'Recommendations', visits: 24, pct: 16 },
  { source: 'External Links', visits: 12, pct: 9 },
]

const statusColor: Record<string, string> = {
  published: '#34d399', under_review: '#fbbf24', draft: '#6b7280',
}
const statusLabel: Record<string, string> = {
  published: 'Published', under_review: 'Under Review', draft: 'Draft',
}
const domainColor: Record<string, string> = {
  'AI & ML': '#60a5fa', 'Blockchain': '#c084fc', 'IoT': '#34d399',
  'Data Science': '#fbbf24', 'Cybersecurity': '#f87171', 'Mobile': '#2dd4bf',
  'Healthcare': '#fb923c', 'Education': '#a78bfa', 'Web Development': '#38bdf8',
}

export default function AnalyticsPage() {
  const maxViews = Math.max(...MONTHLY.map(m => m.views))
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    setProjects(getUploadedProjects())
  }, [])

  const totalStars = projects.reduce((s, p) => s + p.stars, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 6%)', color: 'hsl(210, 40%, 96%)', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(251,191,36,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 style={{ width: 22, height: 22, color: '#fbbf24' }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>Analytics</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 36 }}>
          Track how your projects are performing across the platform.
        </p>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Views', value: '147', icon: Eye, color: '#60a5fa', change: '+34%', up: true },
            { label: 'Total Stars', value: String(totalStars), icon: Star, color: '#fbbf24', change: '+28%', up: true },
            { label: 'Collab Requests', value: '5', icon: Users, color: '#2dd4bf', change: '+2', up: true },
            { label: 'Avg Similarity', value: '47%', icon: TrendingUp, color: '#c084fc', change: '-8%', up: false },
          ].map(s => (
            <div key={s.label} style={{ padding: '20px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon style={{ width: 17, height: 17, color: s.color }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: s.up ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: 3 }}>
                  {s.up ? <ArrowUpRight style={{ width: 13, height: 13 }} /> : <ArrowDownRight style={{ width: 13, height: 13 }} />}
                  {s.change}
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chart + Referrers */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px' }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 24 }}>Views Over Time</h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
              {MONTHLY.map(m => (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{m.views}</span>
                  <div style={{
                    width: '100%', borderRadius: '5px 5px 0 0',
                    background: 'linear-gradient(to top, #3b82f6, #6366f1)',
                    height: `${(m.views / maxViews) * 100}%`, minHeight: 8,
                  }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px' }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Traffic Sources</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {REFERRERS.map(r => (
                <div key={r.source}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 7 }}>
                    <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{r.source}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{r.visits} ({r.pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${r.pct}%`, background: '#3b82f6', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Performance — dynamic */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Project Performance</h2>
          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
              No projects uploaded yet.{' '}
              <Link href="/upload" style={{ color: '#60a5fa', fontWeight: 600 }}>Upload your first project →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {projects.map(p => (
                <Link key={p.id} href={`/project/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', color: 'inherit', transition: 'border-color 0.15s' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.title}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: domainColor[p.domain] || '#60a5fa' }}>{p.domain}</span>
                  </div>
                  {[
                    { label: 'Views', value: Math.floor(Math.random() * 80 + 20) },
                    { label: 'Stars', value: p.stars },
                    { label: 'Collabs', value: Math.floor(Math.random() * 5) },
                  ].map(stat => (
                    <div key={stat.label} style={{ textAlign: 'center', minWidth: 60 }}>
                      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>{stat.value}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{stat.label}</div>
                    </div>
                  ))}
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, whiteSpace: 'nowrap',
                    background: `${statusColor[p.status]}18`, color: statusColor[p.status],
                  }}>
                    {statusLabel[p.status]}
                  </span>
                  <LinkIcon style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
