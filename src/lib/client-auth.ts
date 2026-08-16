// Simple client-side auth using localStorage
// Demo accounts always work. Registered users are stored in localStorage.

export interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'faculty' | 'admin'
  institution: string
}

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'student@demo.com': {
    password: 'demo1234',
    user: { id: 'demo-student', name: 'Priya Sharma', email: 'student@demo.com', role: 'student', institution: 'IIT Bombay' },
  },
  'faculty@demo.com': {
    password: 'demo1234',
    user: { id: 'demo-faculty', name: 'Dr. Ramesh Iyer', email: 'faculty@demo.com', role: 'faculty', institution: 'IIT Bombay' },
  },
  'admin@demo.com': {
    password: 'demo1234',
    user: { id: 'demo-admin', name: 'Ananya Mishra', email: 'admin@demo.com', role: 'admin', institution: 'ProjectSphere HQ' },
  },
}

const USERS_KEY = 'ps_users'
const SESSION_KEY = 'ps_session'

function getStoredUsers(): Record<string, { password: string; user: User }> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  } catch { return {} }
}

function saveStoredUsers(users: Record<string, { password: string; user: User }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function registerUser(
  name: string, email: string, password: string,
  institution: string, role: User['role']
): { success: boolean; error?: string } {
  const stored = getStoredUsers()
  const emailLower = email.toLowerCase()

  if (DEMO_USERS[emailLower] || stored[emailLower]) {
    return { success: false, error: 'An account with this email already exists.' }
  }
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' }
  }

  const user: User = {
    id: `user-${Date.now()}`,
    name, email: emailLower, role, institution,
  }
  stored[emailLower] = { password, user }
  saveStoredUsers(stored)
  setSession(user)
  return { success: true }
}

export function loginUser(email: string, password: string): { success: boolean; error?: string; user?: User } {
  const emailLower = email.toLowerCase()

  // Check demo accounts
  const demo = DEMO_USERS[emailLower]
  if (demo) {
    if (demo.password !== password) return { success: false, error: 'Incorrect password. Try "demo1234" for demo accounts.' }
    setSession(demo.user)
    return { success: true, user: demo.user }
  }

  // Check registered users
  const stored = getStoredUsers()
  const entry = stored[emailLower]
  if (!entry) return { success: false, error: 'No account found with this email. Please register first.' }
  if (entry.password !== password) return { success: false, error: 'Incorrect password. Please try again.' }

  setSession(entry.user)
  return { success: true, user: entry.user }
}

export function setSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function getSession(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}
