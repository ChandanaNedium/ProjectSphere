'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Filter, Network, BookOpen, Users, Tag, TrendingUp, ArrowRight, Star, GitCompare, Clock, ChevronLeft, Home } from 'lucide-react'

const DOMAINS = ['All', 'AI & ML', 'Web Development', 'IoT', 'Cybersecurity', 'Data Science', 'Mobile', 'Blockchain', 'Healthcare', 'Education']
const YEARS = ['All Years', '2024', '2023', '2022', '2021']
const TYPES = ['All Types', 'Research', 'Product', 'Tool', 'Dataset']

const SAMPLE_PROJECTS = [
  {
    id: '1',
    title: 'Smart Campus Energy Management System',
    description: 'IoT-based real-time energy monitoring and optimization across college buildings using ML prediction models. Achieved 23% reduction in energy usage.',
    domain: 'IoT',
    tech: ['Raspberry Pi', 'Python', 'TensorFlow', 'MQTT', 'React'],
    college: 'IIT Bombay',
    year: 2024,
    students: ['Arjun Verma', 'Meera Nair'],
    stars: 47,
    similarity: null,
    type: 'Research',
    status: 'published',
  },
  {
    id: '2',
    title: 'AI-Powered Mental Health Companion',
    description: 'A conversational AI chatbot that provides cognitive behavioral therapy (CBT) exercises and mood tracking for college students experiencing anxiety.',
    domain: 'AI & ML',
    tech: ['Python', 'OpenAI API', 'FastAPI', 'React Native', 'PostgreSQL'],
    college: 'BITS Pilani',
    year: 2024,
    students: ['Sanya Gupta', 'Rohan Das'],
    stars: 89,
    similarity: null,
    type: 'Product',
    status: 'published',
  },
  {
    id: '3',
    title: 'Decentralized Academic Credential Verification',
    description: 'Blockchain-based system to issue, store, and verify academic certificates preventing forgery and enabling instant global verification.',
    domain: 'Blockchain',
    tech: ['Solidity', 'Ethereum', 'Next.js', 'IPFS', 'Web3.js'],
    college: 'NIT Trichy',
    year: 2023,
    students: ['Kiran Rao', 'Divya Patel'],
    stars: 63,
    similarity: null,
    type: 'Tool',
    status: 'published',
  },
  {
    id: '4',
    title: 'Sign Language to Text Real-Time Translator',
    description: 'Computer vision model using MediaPipe and deep learning to translate Indian Sign Language gestures into text and speech in real time.',
    domain: 'AI & ML',
    tech: ['MediaPipe', 'TensorFlow', 'OpenCV', 'Python', 'Flask'],
    college: 'VIT Vellore',
    year: 2024,
    students: ['Aditya Kumar', 'Priya Singh'],
    stars: 112,
    similarity: null,
    type: 'Research',
    status: 'published',
  },
  {
    id: '5',
    title: 'Personalized Rural Healthcare Platform',
    description: 'Telemedicine platform with offline-first architecture and local language support to connect rural patients with doctors across 5 Indian states.',
    domain: 'Healthcare',
    tech: ['React', 'Node.js', 'MongoDB', 'WebRTC', 'PWA'],
    college: 'IIIT Hyderabad',
    year: 2023,
    students: ['Sneha Iyer', 'Mohammed Ali'],
    stars: 78,
    similarity: null,
    type: 'Product',
    status: 'published',
  },
  {
    id: '6',
    title: 'Peer-to-Peer Campus Resource Sharing App',
    description: 'Mobile application enabling college students to lend and borrow textbooks, equipment, and lab instruments with a trust-based reputation system.',
    domain: 'Mobile',
    tech: ['Flutter', 'Firebase', 'Dart', 'Google Maps API'],
    college: 'Jadavpur University',
    year: 2024,
    students: ['Rahul Banerjee', 'Tanya Chowdhury'],
    stars: 34,
    similarity: null,
    type: 'Product',
    status: 'published',
  },
  {
    id: '7',
    title: 'Automated Bug Detection in Open Source Projects',
    description: 'Static analysis tool using transformer-based models to detect common vulnerability patterns in JavaScript and Python codebases with 87% accuracy.',
    domain: 'Cybersecurity',
    tech: ['Python', 'HuggingFace', 'AST', 'Docker', 'GitHub API'],
    college: 'IIT Madras',
    year: 2023,
    students: ['Ananya Krishnan', 'Vikram Reddy'],
    stars: 95,
    similarity: null,
    type: 'Tool',
    status: 'published',
  },
  {
    id: '8',
    title: 'Agriculture Yield Prediction Dashboard',
    description: 'Machine learning system using satellite imagery, soil data, and weather patterns to predict crop yields for 15+ crop types across Indian states.',
    domain: 'Data Science',
    tech: ['Python', 'Scikit-learn', 'Google Earth Engine', 'Streamlit', 'PostgreSQL'],
    college: 'Punjab Agricultural University',
    year: 2024,
    students: ['Gurpreet Singh', 'Harleen Kaur'],
    stars: 56,
    similarity: null,
    type: 'Research',
    status: 'published',
  },
  {
    id: '9',
    title: 'Gamified Adaptive Learning Platform for K-12',
    description: 'AI-driven education platform that adapts difficulty level, content format, and pacing based on individual student performance and engagement.',
    domain: 'Education',
    tech: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'D3.js'],
    college: 'Amrita University',
    year: 2024,
    students: ['Lakshmi Nair', 'Arun Pillai'],
    stars: 71,
    similarity: null,
    type: 'Product',
    status: 'published',
  },
]

const domainColors: Record<string, string> = {
  'AI & ML': '#60a5fa',
  'IoT': '#34d399',
  'Blockchain': '#c084fc',
  'Cybersecurity': '#f87171',
  'Data Science': '#fbbf24',
  'Mobile': '#2dd4bf',
  'Healthcare': '#fb923c',
  'Education': '#a78bfa',
  'Web Development': '#38bdf8',
}

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState('All')
  const [year, setYear] = useState('All Years')
  const [type, setType] = useState('All Types')
  const [selected, setSelected] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'stars' | 'recent'>('stars')

  const filtered = SAMPLE_PROJECTS
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
    <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 6%)', color: 'hsl(210, 40%, 96%)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(10,13,20,0.9)', backdropFilter: 'blur(20px)',
        padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14 }}>
            <Home style={{ width: 16, height: 16 }} />
            Home
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Explore Projects</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {selected.length >= 2 && (
            <Link href={`/compare?ids=${selected.join(',')}`} style={{
              display: 'flex', alignItems: 'center', gap: 6, background: '#8b5cf6',
              color: 'white', padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}>
              <GitCompare style={{ width: 14, height: 14 }} />
              Compare ({selected.length})
            </Link>
          )}
          <Link href="/login" style={{
            background: '#3b82f6', color: 'white', padding: '6px 14px', borderRadius: 8,
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}>Sign In to Upload</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>Explore Projects</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>Browse {SAMPLE_PROJECTS.length}+ student projects from top institutions. Select up to 3 to compare.</p>
        </div>

        {/* Search */}
        <div style={{
          position: 'relative', marginBottom: 24,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
          boxShadow: '0 0 0 0 transparent', transition: 'box-shadow 0.2s',
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
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.35)' }} />
          {/* Domain */}
          <select value={domain} onChange={e => setDomain(e.target.value)} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, color: 'white', padding: '8px 12px', fontSize: 13, cursor: 'pointer', outline: 'none',
          }}>
            {DOMAINS.map(d => <option key={d} value={d} style={{ background: '#0d1117' }}>{d}</option>)}
          </select>
          {/* Year */}
          <select value={year} onChange={e => setYear(e.target.value)} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, color: 'white', padding: '8px 12px', fontSize: 13, cursor: 'pointer', outline: 'none',
          }}>
            {YEARS.map(y => <option key={y} value={y} style={{ background: '#0d1117' }}>{y}</option>)}
          </select>
          {/* Type */}
          <select value={type} onChange={e => setType(e.target.value)} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, color: 'white', padding: '8px 12px', fontSize: 13, cursor: 'pointer', outline: 'none',
          }}>
            {TYPES.map(t => <option key={t} value={t} style={{ background: '#0d1117' }}>{t}</option>)}
          </select>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={() => setSortBy('stars')} style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: sortBy === 'stars' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
              color: sortBy === 'stars' ? '#60a5fa' : 'rgba(255,255,255,0.5)',
            }}>⭐ Top Rated</button>
            <button onClick={() => setSortBy('recent')} style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: sortBy === 'recent' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
              color: sortBy === 'recent' ? '#60a5fa' : 'rgba(255,255,255,0.5)',
            }}>🕐 Recent</button>
          </div>
        </div>

        {/* Domain quick pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
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
          {selected.length > 0 && <span style={{ marginLeft: 12, color: '#a78bfa' }}> · {selected.length} selected for comparison</span>}
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
              return (
                <div key={project.id} style={{
                  borderRadius: 16,
                  background: isSelected ? 'rgba(139,92,246,0.07)' : 'rgba(255,255,255,0.03)',
                  border: isSelected ? '1.5px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  padding: '24px', display: 'flex', flexDirection: 'column', gap: 16,
                  cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
                }}>
                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                        background: `${domainColors[project.domain] || '#60a5fa'}22`,
                        color: domainColors[project.domain] || '#60a5fa',
                        marginBottom: 10,
                      }}>{project.domain}</span>
                      <Link href={`/project/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.4, marginBottom: 0 }}>{project.title}</h3>
                      </Link>
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

                  {/* Description */}
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, flex: 1 }}>
                    {project.description.length > 120 ? project.description.slice(0, 120) + '…' : project.description}
                  </p>

                  {/* Tech tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {project.tech.slice(0, 4).map(t => (
                      <span key={t} style={{
                        padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}>{t}</span>
                    ))}
                    {project.tech.length > 4 && (
                      <span style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>+{project.tech.length - 4}</span>
                    )}
                  </div>

                  {/* Footer */}
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

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/project/${project.id}`} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '8px', borderRadius: 8, background: 'rgba(59,130,246,0.1)',
                      color: '#60a5fa', fontSize: 12, fontWeight: 600, textDecoration: 'none',
                      border: '1px solid rgba(59,130,246,0.2)',
                    }}>
                      View Details <ArrowRight style={{ width: 12, height: 12 }} />
                    </Link>
                    <Link href={`/similarity?ref=${project.id}`} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '8px 12px', borderRadius: 8, background: 'rgba(139,92,246,0.1)',
                      color: '#c084fc', fontSize: 12, fontWeight: 600, textDecoration: 'none',
                      border: '1px solid rgba(139,92,246,0.2)',
                    }}>
                      <GitCompare style={{ width: 12, height: 12 }} />
                      Similarity
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
