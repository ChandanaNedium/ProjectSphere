'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Network, Eye, EyeOff, ArrowRight, Loader2, Mail, Lock, Home, CheckCircle } from 'lucide-react'
import { loginUser } from '@/lib/client-auth'



export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Please enter your email address.'); return }
    if (!password) { setError('Please enter your password.'); return }

    setLoading(true)
    // Instant auth — no artificial delay
    const result = loginUser(email.trim(), password)
    if (result.success) {
      setSuccess(true)
      router.push('/dashboard')
    } else {
      setError(result.error || 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  const inputBox = {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '0 14px',
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'hsl(222, 47%, 6%)', color: 'hsl(210, 40%, 96%)',
      fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative',
    }}>
      {/* Glow orbs */}
      <div style={{ position: 'fixed', top: '20%', left: '30%', width: 400, height: 400, background: 'rgba(59,130,246,0.06)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '20%', width: 300, height: 300, background: 'rgba(139,92,246,0.05)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <Link href="/" style={{ position: 'fixed', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 14 }}>
        <Home style={{ width: 16, height: 16 }} /> Home
      </Link>

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
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
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>Sign in to your ProjectSphere account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '12px 16px', color: '#f87171', fontSize: 14,
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
              borderRadius: 10, padding: '12px 16px', color: '#34d399', fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <CheckCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
              Signed in! Taking you to dashboard…
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}>Email address</label>
            <div style={inputBox}>
              <Mail style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@university.edu" autoComplete="email"
                disabled={loading || success}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 14, padding: '13px 0', width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}>Password</label>
            <div style={inputBox}>
              <Lock style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              <input
                type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                disabled={loading || success}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 14, padding: '13px 0', width: '100%' }}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', flexShrink: 0, padding: 0 }}>
                {showPwd ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            style={{
              width: '100%', padding: '14px', borderRadius: 10, fontWeight: 700, fontSize: 15,
              background: success ? '#34d399' : loading ? 'rgba(59,130,246,0.6)' : '#3b82f6',
              color: 'white', border: 'none', cursor: (loading || success) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(59,130,246,0.3)', transition: 'background 0.2s', marginTop: 4,
            }}
          >
            {loading ? (
              <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Signing in…</>
            ) : success ? (
              <><CheckCircle style={{ width: 18, height: 18 }} /> Signed in!</>
            ) : (
              <><ArrowRight style={{ width: 18, height: 18 }} /> Sign In</>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>Create one free →</Link>
        </p>

        {/* Quick Demo Logins */}
        <div style={{ marginTop: 28, padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
            ⚡ Quick Demo Logins for Testing:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                loginUser('riya@demo.com', 'demo1234')
                router.push('/dashboard')
              }}
              style={{
                padding: '8px 12px', borderRadius: 8, background: 'rgba(59,130,246,0.12)',
                border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              🎓 Riya (Student)
            </button>
            <button
              type="button"
              onClick={() => {
                loginUser('priya@demo.com', 'demo1234')
                router.push('/dashboard')
              }}
              style={{
                padding: '8px 12px', borderRadius: 8, background: 'rgba(192,132,252,0.12)',
                border: '1px solid rgba(192,132,252,0.3)', color: '#c084fc', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              👨‍🏫 Priya (Faculty)
            </button>
          </div>
        </div>


      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
