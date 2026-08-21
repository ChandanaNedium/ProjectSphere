// Simple client-side auth using localStorage
// Demo accounts always work. Registered users are stored in localStorage.

export interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'faculty'
  institution: string
  skills?: string[]
  bio?: string
  interests?: string
}

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'faculty@demo.com': {
    password: 'demo1234',
    user: { id: 'demo-faculty', name: 'Dr. Ramesh Iyer', email: 'faculty@demo.com', role: 'faculty', institution: 'IIT Bombay', skills: ['Machine Learning', 'NLP', 'Research Guidance'], bio: 'Senior Professor in CS & AI. Open to mentoring innovative student projects.', interests: 'AI, Deep Learning, NLP' },
  },
}

const DEFAULT_USERS: User[] = [
  { id: 'demo-faculty', name: 'Dr. Ramesh Iyer', email: 'faculty@demo.com', role: 'faculty', institution: 'IIT Bombay', skills: ['Machine Learning', 'NLP', 'Research Guidance'], bio: 'Senior Professor in CS & AI. Open to mentoring innovative student projects.', interests: 'AI, Deep Learning, NLP' },
  { id: '1', name: 'Arjun Verma', email: 'arjun.verma@iitb.ac.in', role: 'student', institution: 'IIT Bombay', skills: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision'], bio: 'Passionate about building AI systems that solve real-world problems. Looking for collaborators in NLP and robotics.', interests: 'NLP, Computer Vision, Robotics, Healthcare AI' },
  { id: '2', name: 'Sanya Gupta', email: 'sanya.gupta@bits-pilani.ac.in', role: 'student', institution: 'BITS Pilani', skills: ['R', 'Python', 'SQL', 'Tableau', 'Statistics'], bio: 'Data scientist focused on healthcare analytics. Open to interdisciplinary collaborations.', interests: 'Healthcare Analytics, Clinical ML, Bioinformatics' },
  { id: '3', name: 'Kiran Rao', email: 'kiran.rao@nitt.edu', role: 'student', institution: 'NIT Trichy', skills: ['Solidity', 'Web3.js', 'Ethereum', 'IPFS', 'Rust'], bio: 'Building decentralized systems for education and supply chain. Currently busy with thesis.', interests: 'DeFi, NFTs, Smart Contracts, DAO Governance' },
  { id: '4', name: 'Meera Nair', email: 'meera.nair@iiit.ac.in', role: 'student', institution: 'IIIT Hyderabad', skills: ['React', 'Figma', 'User Research', 'Accessibility', 'D3.js'], bio: 'Designing interfaces that are inclusive and delightful. Interested in AI-assisted UX tools.', interests: 'Inclusive Design, Voice UI, AI-driven UX, Affective Computing' },
  { id: '5', name: 'Vikram Reddy', email: 'vikram.reddy@iitm.ac.in', role: 'student', institution: 'IIT Madras', skills: ['Penetration Testing', 'Go', 'Docker', 'Kubernetes', 'CTF'], bio: 'Security researcher with multiple CVEs. Love building tools for the security community.', interests: 'Zero-day research, Malware analysis, Secure systems, CTF' },
  { id: '6', name: 'Lakshmi Nair', email: 'lakshmi.nair@amrita.edu', role: 'student', institution: 'Amrita University', skills: ['Flutter', 'Firebase', 'Node.js', 'Gamification', 'MongoDB'], bio: 'Building the next generation of adaptive learning tools. Open to partnerships with NGOs.', interests: 'EdTech, Gamification, Adaptive Learning, Social Impact' },
]

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

export function getAllRegisteredUsers(): User[] {
  const storedObj = getStoredUsers()
  const storedUsers = Object.values(storedObj).map(u => u.user)
  
  const map = new Map<string, User>()
  DEFAULT_USERS.forEach(u => map.set(u.email.toLowerCase(), u))
  storedUsers.forEach(u => map.set(u.email.toLowerCase(), u))
  return Array.from(map.values())
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
    skills: role === 'faculty' ? ['Mentorship', 'Project Review', 'Research'] : ['Full Stack', 'Problem Solving', 'Git'],
    bio: `${role === 'faculty' ? 'Faculty mentor' : 'Student developer'} registered on ProjectSphere from ${institution}.`,
    interests: 'Innovation, Collaboration, Open Source',
  }
  stored[emailLower] = { password, user }
  saveStoredUsers(stored)
  setSession(user)

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event("storage"))
  }
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
