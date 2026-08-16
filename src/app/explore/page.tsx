'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, BookOpen, Star, GitCompare, ArrowRight } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { getAllProjects, type Project } from '@/lib/projects'

const DOMAINS = ['All', 'AI & ML', 'Web Development', 'IoT', 'Cybersecurity', 'Data Science', 'Mobile', 'Blockchain', 'Healthcare', 'Education', 'Green Tech']
const YEARS = ['All Years', '2025', '2024', '2023', '2022', '2021']
const TYPES = ['All Types', 'Research', 'Product', 'Tool', 'Dataset']

const domainColors: Record<string, string> = {
  'AI & ML': '#60a5fa', 'IoT': '#34d399', 'Blockchain': '#c084fc',
  'Cybersecurity': '#f87171', 'Data Science': '#fbbf24', 'Mobile': '#2dd4bf',
  'Healthcare': '#fb923c', 'Education': '#a78bfa', 'Web Development': '#38bdf8',
  'Green Tech': '#22d3ee',
}

const statusColor: Record<string, string> = {
  published: '#34d399', under_review: '#fbbf24', draft: '#6b7280',
}
const statusLabel: Record<string, string> = {
  published: 'Published', under_review: 'Under Review', draft: 'Draft',
}

export default function ExplorePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState('All')
  const [year, setYear] = useState('All Years')
  const [type, setType] = useState('All Types')
  const [selected, setSelected] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'stars' | 'recent'>('stars')

  // Load projects from store (includes user uploads)
  useEffect(() => {
    setProjects(getAllProjects())
  }, [])

  const filtered = projects
    .filter(p => {
      const q = query.toLowerCase()
      if (q && !p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q) && !p.tech.join(' ').toLowerCase().includes(q)) return false
      if (domain !== 'All' && p.domain !== domain) return false
      if (year !== 'All Years' && p.year !== Number(year)) return false
      if (type !== 'All Types' && p.type !== type) return false
      return true
    })
    .sort((a, b) => sortBy === 'stars' ? b.stars - a.stars : b.year - a.year)

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 6%)', color: 'hsl(210, 40%, 96%)', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>Explore Projects</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
              Browse {projects.length}+ student projects from top institutions. Select up to 3 to compare.
            </p>
          </div>
          {selected.length >= 2 && (
            <Link href={`/compare?ids=${selected.join(',')}`} style={{
              display: 'flex', alignItems: 'center', gap: 6, background: '#8b5cf6',
              color: 'white', padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}>
              <GitCompare style={{ width: 14, height: 14 }} />
              Compare ({selected.length})
            </Link>
          )}
        </div>

        {/* Search */}
        <div style={{
          marginBottom: 20,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
        }}>
          <Search style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by title, technology, keyword, or problem statement..."
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'white', fontSize: 15, width: '100%', padding: '14px 0',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18 }}>×</button>
          )}
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.35)' }} />
          <select value={domain} onChange={e => setDomain(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', padding: '8px 12px', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
            {DOMAINS.map(d => <option key={d} value={d} style={{ background: '#0d1117' }}>{d}</option>)}
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', padding: '8px 12px', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
            {YEARS.map(y => <option key={y} value={y} style={{ background: '#0d1117' }}>{y}</option>)}
          </select>
          <select value={type} onChange={e => setType(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', padding: '8px 12px', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
            {TYPES.map(t => <option key={t} value={t} style={{ background: '#0d1117' }}>{t}</option>)}
          </select>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={() => setSortBy('stars')} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: sortBy === 'stars' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)', color: sortBy === 'stars' ? '#60a5fa' : 'rgba(255,255,255,0.5)' }}>⭐ Top Rated</button>
            <button onClick={() => setSortBy('recent')} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: sortBy === 'recent' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)', color: sortBy === 'recent' ? '#60a5fa' : 'rgba(255,255,255,0.5)' }}>🕐 Recent</button>
          </div>
        </div>

        {/* Domain pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {DOMAINS.map(d => (
            <button key={d} onClick={() => setDomain(d)} style={{
              padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: domain === d ? (domainColors[d] ? `${domainColors[d]}22` : 'rgba(59,130,246,0.15)') : 'transparent',
              border: domain === d ? `1px solid ${domainColors[d] || '#3b82f6'}55` : '1px solid rgba(255,255,255,0.08)',
              color: domain === d ? (domainColors[d] || '#60a5fa') : 'rgba(255,255,255,0.45)',
              transition: 'all 0.15s',
            }}>{d}</button>
          ))}
        </div>

        {/* Results count */}
        <div style={{ marginBottom: 20, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
          Showing <strong style={{ color: 'white' }}>{filtered.length}</strong> projects
          {selected.length > 0 && <span style={{ marginLeft: 12, color: '#a78bfa' }}>· {selected.length} selected for comparison</span>}
        </div>

        {/* Project Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)' }}>
            <BookOpen style={{ width: 48, height: 48, margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: 18, fontWeight: 600 }}>No projects match your filters</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {filtered.map(project => {
              const isSelected = selected.includes(project.id)
              const color = domainColors[project.domain] || '#60a5fa'
              return (
                <div key={project.id} style={{
                  borderRadius: 16,
                  background: isSelected ? 'rgba(139,92,246,0.07)' : 'rgba(255,255,255,0.03)',
                  border: isSelected ? '1.5px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  padding: '24px', display: 'flex', flexDirection: 'column', gap: 16,
                  transition: 'border-color 0.2s, background 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                          background: `${color}22`, color: color,
                        }}>{project.domain}</span>
                        {project.status === 'under_review' && (
                          <span style={{
                            padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                            background: `${statusColor[project.status]}18`, color: statusColor[project.status],
                          }}>{statusLabel[project.status]}</span>
                        )}
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.4, marginBottom: 0 }}>{project.title}</h3>
                    </div>
                    <button
                      onClick={() => toggleSelect(project.id)}
                      title={isSelected ? 'Deselect' : 'Select to compare'}
                      style={{
                        width: 28, height: 28, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
                        background: isSelected ? '#8b5cf6' : 'rgba(255,255,255,0.07)',
                        border: isSelected ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.12)',
                        color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {isSelected ? '✓' : '+'}
                    </button>
                  </div>

                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, flex: 1 }}>
                    {project.description.length > 120 ? project.description.slice(0, 120) + '…' : project.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {project.tech.slice(0, 4).map(t => (
                      <span key={t} style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>{t}</span>
                    ))}
                    {project.tech.length > 4 && <span style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>+{project.tech.length - 4}</span>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>{project.college}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)' }}>{project.students.join(', ')} · {project.year}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24' }}>
                      <Star style={{ width: 13, height: 13, fill: '#fbbf24' }} />
                      <span style={{ fontWeight: 700 }}>{project.stars}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/project/${project.id}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 8, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(59,130,246,0.2)' }}>
                      View Details <ArrowRight style={{ width: 12, height: 12 }} />
                    </Link>
                    <Link href={`/similarity?ref=${project.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: 'rgba(139,92,246,0.1)', color: '#c084fc', fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(139,92,246,0.2)' }}>
                      <GitCompare style={{ width: 12, height: 12 }} /> Similarity
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
