'use client'

import { useState } from 'react'
import { Search, GitCompare, CheckCircle, AlertTriangle, XCircle, BarChart2, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

const RESULT = {
  overall: 38,
  breakdown: {
    'Problem Domain': 72,
    'Methodology': 45,
    'Technology': 28,
    'Outcomes': 22,
  },
  similar: [
    { id: '3', title: 'Smart Grid Energy Distribution using ML', college: 'IIT Kharagpur', year: 2023, overallSim: 67 },
    { id: '5', title: 'IoT Campus Power Monitoring Dashboard', college: 'NIT Surathkal', year: 2022, overallSim: 54 },
    { id: '8', title: 'Renewable Energy Forecasting with LSTM', college: 'VIT Chennai', year: 2024, overallSim: 31 },
  ],
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
    </div>
  )
}

function getSeverity(score: number) {
  if (score < 30) return { color: '#34d399', label: 'Low Similarity', icon: CheckCircle }
  if (score < 50) return { color: '#fbbf24', label: 'Moderate Similarity', icon: AlertTriangle }
  if (score < 70) return { color: '#fb923c', label: 'High Similarity', icon: AlertTriangle }
  return { color: '#f87171', label: 'Very High Similarity', icon: XCircle }
}

export default function SimilarityPage() {
  const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tech, setTech] = useState('')

  const handleAnalyze = () => {
    if (!title || !description) return
    setStep('analyzing')
    setTimeout(() => setStep('result'), 2500)
  }

  const overall = getSeverity(RESULT.overall)

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 6%)', color: 'hsl(210, 40%, 96%)', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitCompare style={{ width: 22, height: 22, color: '#c084fc' }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>Similarity Check</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 36 }}>
          Describe your project to compare it against 1,200+ projects in our knowledge base.
        </p>

        <div style={{ maxWidth: 860 }}>
          {step === 'input' && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'rgba(255,255,255,0.7)' }}>Project Title *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Smart Campus Energy Management System"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', padding: '13px 16px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'rgba(255,255,255,0.7)' }}>Project Description *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the problem your project solves, the approach, methodology, and expected outcomes..."
                  rows={5}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', padding: '13px 16px', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'rgba(255,255,255,0.7)' }}>Technologies Used (comma-separated)</label>
                <input
                  value={tech}
                  onChange={e => setTech(e.target.value)}
                  placeholder="e.g. Python, TensorFlow, Raspberry Pi, MQTT, React"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', padding: '13px 16px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={!title || !description}
                style={{
                  padding: '14px', borderRadius: 10, fontWeight: 700, fontSize: 15,
                  background: (!title || !description) ? 'rgba(139,92,246,0.3)' : '#8b5cf6',
                  color: 'white', border: 'none', cursor: (!title || !description) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
                }}
              >
                <Search style={{ width: 18, height: 18 }} />
                Run Similarity Analysis
              </button>
            </div>
          )}

          {step === 'analyzing' && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '60px 28px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <BarChart2 style={{ width: 28, height: 28, color: '#c084fc' }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Analyzing your project…</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 28 }}>
                Comparing against 1,200+ projects across problem domain, methodology, technology, and outcomes.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Scanning problem domain…', 'Comparing methodologies…', 'Checking technology stack…', 'Generating similarity scores…'].map(msg => (
                  <div key={msg} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6' }} />
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'result' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Score */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: `1.5px solid ${overall.color}33`, borderRadius: 16, padding: '28px', display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{
                  width: 100, height: 100, borderRadius: '50%', flexShrink: 0,
                  background: `conic-gradient(${overall.color} ${RESULT.overall * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'hsl(222, 47%, 8%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: overall.color }}>{RESULT.overall}%</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>Overall Similarity</span>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: overall.color, marginBottom: 8 }}>{overall.label}</h2>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 500 }}>
                    Your project has <strong style={{ color: 'white' }}>{RESULT.overall}% similarity</strong> with existing work. This is considered low — your idea shows good originality.
                  </p>
                  <button onClick={() => { setStep('input'); setTitle(''); setDescription(''); setTech('') }}
                    style={{ marginTop: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                    Check another project
                  </button>
                </div>
              </div>

              {/* Breakdown */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px' }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Similarity Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {Object.entries(RESULT.breakdown).map(([key, val]) => {
                    const s = getSeverity(val)
                    return (
                      <div key={key}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{key}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{val}%</span>
                        </div>
                        <ProgressBar value={val} color={s.color} />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Similar projects */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px' }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Most Similar Projects</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {RESULT.similar.map(p => {
                    const sv = getSeverity(p.overallSim)
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.title}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{p.college} · {p.year}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: sv.color }}>{p.overallSim}%</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>similar</div>
                        </div>
                        <Link href={`/project/${p.id}`} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(59,130,246,0.2)', whiteSpace: 'nowrap' }}>View Project</Link>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Tips */}
              <div style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 16, padding: '24px' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <Lightbulb style={{ width: 20, height: 20, color: '#c084fc', flexShrink: 0 }} />
                  <h3 style={{ fontWeight: 700, fontSize: 16 }}>How to differentiate your project</h3>
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 0, listStyle: 'none', margin: 0 }}>
                  {[
                    'Focus on a specific building type (e.g. labs vs. dormitories) for targeted optimization.',
                    'Add predictive maintenance features for HVAC and lighting systems.',
                    'Incorporate occupancy sensing via computer vision for real-time demand forecasting.',
                    'Extend to renewable energy integration with solar panel output prediction.',
                  ].map(tip => (
                    <li key={tip} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                      <span style={{ color: '#c084fc', flexShrink: 0 }}>→</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
