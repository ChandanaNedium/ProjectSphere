'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, FileText, Tag, Code, Link2, CheckCircle, Eye } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { saveUploadedProject, type Project } from '@/lib/projects'
import { getSession } from '@/lib/client-auth'

const DOMAINS = ['AI & ML', 'Web Development', 'IoT', 'Cybersecurity', 'Data Science', 'Mobile', 'Blockchain', 'Healthcare', 'Education', 'Green Tech']

export default function UploadPage() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [savedId, setSavedId] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', domain: '', tech: '', github: '', year: '2025', type: 'Research',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.domain) return

    const user = getSession()
    const newProject: Project = {
      id: `upload-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      domain: form.domain,
      tech: form.tech ? form.tech.split(',').map(t => t.trim()).filter(Boolean) : [],
      college: user?.institution || 'Unknown Institution',
      year: parseInt(form.year),
      students: user ? [user.name] : ['Anonymous'],
      stars: 0,
      type: form.type,
      github: form.github.trim() || undefined,
      status: 'under_review',
      uploadedBy: user?.email || undefined,
      uploadedAt: new Date().toISOString(),
    }

    saveUploadedProject(newProject)
    setSavedId(newProject.id)
    setStep('success')
  }

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: 'white', padding: '13px 16px', fontSize: 14, outline: 'none',
    boxSizing: 'border-box' as const,
  }
  const labelStyle = { display: 'block' as const, fontSize: 13, fontWeight: 600 as const, marginBottom: 10, color: 'rgba(255,255,255,0.7)' }

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 6%)', color: 'hsl(210, 40%, 96%)', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', minWidth: 0 }}>
        {step === 'success' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center', maxWidth: 520 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle style={{ width: 36, height: 36, color: '#34d399' }} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Project Submitted!</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                Your project <strong style={{ color: 'white' }}>&ldquo;{form.title}&rdquo;</strong> has been saved and is now visible in the Explore page. It&apos;s marked as &ldquo;Under Review&rdquo; until our team verifies originality.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href={`/project/${savedId}`}
                  style={{ padding: '10px 20px', borderRadius: 9, background: '#3b82f6', color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Eye style={{ width: 15, height: 15 }} /> View Project
                </Link>
                <Link
                  href="/explore"
                  style={{ padding: '10px 20px', borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
                >
                  Browse Explore
                </Link>
                <button
                  onClick={() => { setStep('form'); setForm({ title: '', description: '', domain: '', tech: '', github: '', year: '2025', type: 'Research' }); setSavedId('') }}
                  style={{ padding: '10px 20px', borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Upload Another
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload style={{ width: 22, height: 22, color: '#60a5fa' }} />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>Upload Project</h1>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 36 }}>
              Share your project with 10,000+ students across India. We&apos;ll run an originality check before publishing.
            </p>

            <form onSubmit={handleSubmit} style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={labelStyle}><FileText style={{ width: 13, height: 13, display: 'inline', marginRight: 6 }} />Project Title *</label>
                  <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Smart Campus Energy Management" style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}><Tag style={{ width: 13, height: 13, display: 'inline', marginRight: 6 }} />Domain *</label>
                  <select value={form.domain} onChange={e => update('domain', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }} required>
                    <option value="" style={{ background: '#0d1117' }}>Select domain…</option>
                    {DOMAINS.map(d => <option key={d} value={d} style={{ background: '#0d1117' }}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Project Description *</label>
                <textarea
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="Describe the problem your project solves, the methodology, key features, and impact…"
                  rows={6}
                  required
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 20 }}>
                <div>
                  <label style={labelStyle}><Code style={{ width: 13, height: 13, display: 'inline', marginRight: 6 }} />Technologies Used</label>
                  <input value={form.tech} onChange={e => update('tech', e.target.value)} placeholder="Python, TensorFlow, React, Node.js…" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Year</label>
                  <select value={form.year} onChange={e => update('year', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {['2025', '2024', '2023', '2022', '2021'].map(y => <option key={y} value={y} style={{ background: '#0d1117' }}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Project Type</label>
                  <select value={form.type} onChange={e => update('type', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {['Research', 'Product', 'Tool', 'Dataset'].map(t => <option key={t} value={t} style={{ background: '#0d1117' }}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}><Link2 style={{ width: 13, height: 13, display: 'inline', marginRight: 6 }} />GitHub / Demo Link (optional)</label>
                <input value={form.github} onChange={e => update('github', e.target.value)} placeholder="https://github.com/yourusername/project" style={inputStyle} type="url" />
              </div>

              <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                📋 After submission, our AI will run a <strong style={{ color: 'white' }}>similarity analysis</strong> comparing your project against 1,200+ existing projects. You&apos;ll receive a detailed originality report within 24 hours.
              </div>

              <button
                type="submit"
                disabled={!form.title || !form.description || !form.domain}
                style={{
                  padding: '14px 24px', borderRadius: 10, fontWeight: 700, fontSize: 15,
                  background: (!form.title || !form.description || !form.domain) ? 'rgba(59,130,246,0.3)' : '#3b82f6',
                  color: 'white', border: 'none',
                  cursor: (!form.title || !form.description || !form.domain) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content',
                  boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
                }}
              >
                <Upload style={{ width: 18, height: 18 }} />
                Submit Project for Review
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
