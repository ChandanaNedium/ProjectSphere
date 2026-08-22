'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Network, Home, Search, GitCompare, Lightbulb, Users, BarChart2, Shield,
  Upload, LogOut, CheckCircle, Award
} from 'lucide-react'
import { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { getSession, logout, type User } from '@/lib/client-auth'

const NAV = [
  { icon: Home,       label: 'Dashboard',             href: '/dashboard' },
  { icon: Search,     label: 'Explore',                href: '/explore' },
  { icon: Upload,     label: 'Upload Project',         href: '/upload' },
  { icon: GitCompare, label: 'Similarity Check',       href: '/similarity' },
  { icon: Lightbulb,  label: 'Innovation Insights',    href: '/insights' },
  { icon: Users,      label: 'Collaborations',         href: '/collaborate' },
  { icon: CheckCircle,label: 'Collaboration Approvals',href: '/collaborate?tab=approvals' },
  { icon: BarChart2,  label: 'Analytics',              href: '/analytics' },
  { icon: Shield,     label: 'Originality Reports',    href: '/reports' },
]

// Faculty specific navigation items (visible only to faculty role)
const FACULTY_NAV = [
  { icon: CheckCircle, label: 'Review Submissions', href: '/faculty/review' },
  { icon: Award,       label: 'Endorse Projects',   href: '/faculty/endorse' },
  { icon: Users,       label: 'Faculty Collabs',    href: '/faculty/collabs' },
  { icon: BarChart2,   label: 'Domain Stats',      href: '/faculty/stats' },
]

// Use useLayoutEffect on client, useEffect as fallback (SSR)
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [checked, setChecked] = useState(false)
  const redirecting = useRef(false)

  // Run synchronously before paint — eliminates blank flash
  useIsomorphicLayoutEffect(() => {
    const session = getSession()
    if (!session && !redirecting.current) {
      redirecting.current = true
      router.replace('/login')
    } else {
      setUser(session)
      setChecked(true)
    }
  }, [router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // While auth check runs, show a minimal placeholder sidebar (no flash)
  if (!checked) {
    return (
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.07)',
        height: '100vh', position: 'sticky', top: 0,
      }} />
    )
  }

  if (!user) return null

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column', padding: '20px 12px',
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Logo */}
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

        {/* Navigation */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...NAV, ...(user?.role === 'faculty' ? FACULTY_NAV : [])].map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                  borderRadius: 8, textDecoration: 'none', fontSize: 13.5, fontWeight: 600,
                  background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                  color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                  transition: 'background 0.15s, color 0.15s',
                  borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                }}
              >
                <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                {item.label}
              </Link>
            );
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
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.institution} · {user.role}
            </div>
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
  )
}
