'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Network, Eye, EyeOff, ArrowRight, Loader2, Mail, Lock, User, GraduationCap, Home } from 'lucide-react'

const ROLES = [
  { value: 'student', label: 'Student', desc: 'Upload, discover, and collaborate on projects' },
  { value: 'faculty', label: 'Faculty', desc: 'Review projects and provide mentorship' },
  { value: 'admin', label: 'Institution Admin', desc: 'Manage your institution\'s projects' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [institution, setInstitution] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 1400))
    if (name && email && password && institution) {
      router.push('/dashboard')
    } else {
      setError('Please fill in all required fields.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'hsl(222, 47%, 6%)', color: 'hsl(210, 40%, 96%)',
      fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative',
    }}>
      <div style={{ position: 'fixed', top: '15%', right: '20%', width: 400, height: 400, background: 'rgba(99,102,241,0.06)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <Link href="/" style={{
        position: 'fixed', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 6,
        color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 14,
      }}>
        <Home style={{ width: 16, height: 16 }} /> Home
      </Link>

      <div style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
          }}>
            <Network style={{ width: 24, height: 24, color: 'white' }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>Join the student project knowledge ecosystem</p>
        </div>

        {/* Role picker */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'rgba(255,255,255,0.6)' }}>I am a…</p>
          <div style={{ display: 'flex', gap: 10 }}>
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                  background: role === r.value ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                  border: role === r.value ? '1.5px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  color: role === r.value ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13 }}>{r.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#f87171', fontSize: 14 }}>
              {error}
            </div>
          )}

          {[
            { icon: User, label: 'Full Name', value: name, set: setName, placeholder: 'Priya Sharma', type: 'text' },
            { icon: Mail, label: 'Email address', value: email, set: setEmail, placeholder: 'priya@iitb.ac.in', type: 'email' },
            { icon: GraduationCap, label: 'Institution / College', value: institution, set: setInstitution, placeholder: 'IIT Bombay', type: 'text' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}>{f.label}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0 14px' }}>
                <f.icon style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                <input
                  type={f.type} value={f.value} onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 14, padding: '13px 0', width: '100%' }}
                />
              </div>
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}>Password</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0 14px' }}>
              <Lock style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              <input
                type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 14, padding: '13px 0', width: '100%' }}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                {showPwd ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 10, fontWeight: 700, fontSize: 15,
              background: loading ? 'rgba(59,130,246,0.6)' : '#3b82f6',
              color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(59,130,246,0.3)', marginTop: 4,
            }}
          >
            {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <ArrowRight style={{ width: 18, height: 18 }} />}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
