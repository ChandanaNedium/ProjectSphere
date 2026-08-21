// Shared project store using localStorage
// Combines hardcoded sample projects with user-uploaded ones

export type ProjectStatus = 'published' | 'approved' | 'under_review' | 'rejected' | 'draft'

export interface Project {
  id: string
  title: string
  description: string
  domain: string
  tech: string[]
  college: string
  year: number
  students: string[]
  stars: number
  type: string
  github?: string
  status: ProjectStatus
  uploadedBy?: string // user email
  uploadedAt?: string // ISO date
  collaborators?: string[] // collaborator emails or names
}

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Smart Campus Energy Management System',
    description: 'IoT-based real-time energy monitoring and optimization across college buildings using ML prediction models. The system uses Raspberry Pi units deployed across 12 campus buildings to collect power usage metrics every 30 seconds. A central ML pipeline built with TensorFlow processes historical usage patterns and predicts peak demand windows, enabling automated HVAC and lighting adjustments. Achieved 23% reduction in energy usage over a 6-month pilot deployment at IIT Bombay.',
    domain: 'IoT',
    tech: ['Raspberry Pi', 'Python', 'TensorFlow', 'MQTT', 'React'],
    college: 'IIT Bombay',
    year: 2024,
    students: ['Arjun Verma', 'Meera Nair'],
    stars: 47,
    type: 'Research',
    github: 'https://github.com/arjunv/smart-campus-energy',
    status: 'published',
  },
  {
    id: 'proj-2',
    title: 'AI-Powered Mental Health Companion',
    description: 'A conversational AI chatbot that provides cognitive behavioral therapy (CBT) exercises and mood tracking for college students experiencing anxiety. Built on top of a fine-tuned GPT model with guardrails for sensitive topics. Features daily mood check-ins, guided breathing exercises, journaling prompts, and crisis resource links. Validated through a 200-student pilot at BITS Pilani showing 34% improvement in self-reported well-being scores.',
    domain: 'AI & ML',
    tech: ['Python', 'OpenAI API', 'FastAPI', 'React Native', 'PostgreSQL'],
    college: 'BITS Pilani',
    year: 2024,
    students: ['Sanya Gupta', 'Rohan Das'],
    stars: 89,
    type: 'Product',
    github: 'https://github.com/sanyag/mindease-ai',
    status: 'published',
  },
  {
    id: 'proj-3',
    title: 'Decentralized Academic Credential Verification',
    description: 'Blockchain-based system to issue, store, and verify academic certificates preventing forgery and enabling instant global verification. Uses Ethereum smart contracts to store credential hashes on-chain while keeping actual documents on IPFS for decentralized storage. Includes a Web3 verification portal where employers can instantly validate certificates by scanning a QR code. Piloted with NIT Trichy for 500+ degree certificates.',
    domain: 'Blockchain',
    tech: ['Solidity', 'Ethereum', 'Next.js', 'IPFS', 'Web3.js'],
    college: 'NIT Trichy',
    year: 2023,
    students: ['Kiran Rao', 'Divya Patel'],
    stars: 63,
    type: 'Tool',
    github: 'https://github.com/kiranrao/certichain',
    status: 'published',
  },
  {
    id: 'proj-4',
    title: 'Sign Language to Text Real-Time Translator',
    description: 'Computer vision model using MediaPipe and deep learning to translate Indian Sign Language gestures into text and speech in real time. The system processes webcam input at 30 FPS, identifies hand landmarks using MediaPipe, and classifies gestures through a custom CNN-LSTM architecture trained on 15,000+ labeled gesture samples across 200 ISL signs. Achieves 94.2% accuracy on the test set and works in low-light conditions.',
    domain: 'AI & ML',
    tech: ['MediaPipe', 'TensorFlow', 'OpenCV', 'Python', 'Flask'],
    college: 'VIT Vellore',
    year: 2024,
    students: ['Aditya Kumar', 'Priya Singh'],
    stars: 112,
    type: 'Research',
    github: 'https://github.com/adityak/isl-translator',
    status: 'published',
  },
  {
    id: 'proj-5',
    title: 'Personalized Rural Healthcare Platform',
    description: 'Telemedicine platform with offline-first architecture and local language support to connect rural patients with doctors across 5 Indian states. Built as a Progressive Web App that caches patient records locally and syncs when connectivity is available. Supports video consultations via WebRTC with adaptive bitrate for low-bandwidth areas. Integrated with ASHA worker workflow for community health monitoring. Currently serving 2,000+ patients monthly.',
    domain: 'Healthcare',
    tech: ['React', 'Node.js', 'MongoDB', 'WebRTC', 'PWA'],
    college: 'IIIT Hyderabad',
    year: 2023,
    students: ['Sneha Iyer', 'Mohammed Ali'],
    stars: 78,
    type: 'Product',
    status: 'published',
  },
  {
    id: 'proj-6',
    title: 'Peer-to-Peer Campus Resource Sharing App',
    description: 'Mobile application enabling college students to lend and borrow textbooks, equipment, and lab instruments with a trust-based reputation system. Features include a catalog with barcode scanning for easy listing, in-app messaging, pickup scheduling, and a karma-based trust score. Built with Flutter for cross-platform support. Over 800 active users at Jadavpur University sharing 1,200+ items.',
    domain: 'Mobile',
    tech: ['Flutter', 'Firebase', 'Dart', 'Google Maps API'],
    college: 'Jadavpur University',
    year: 2024,
    students: ['Rahul Banerjee', 'Tanya Chowdhury'],
    stars: 34,
    type: 'Product',
    github: 'https://github.com/rahulb/campusshare',
    status: 'published',
  },
  {
    id: 'proj-7',
    title: 'Automated Bug Detection in Open Source Projects',
    description: 'Static analysis tool using transformer-based models to detect common vulnerability patterns in JavaScript and Python codebases with 87% accuracy. The tool integrates with GitHub Actions to automatically scan pull requests and flag potential security issues including SQL injection, XSS, path traversal, and insecure deserialization. Trained on a curated dataset of 50,000+ known vulnerabilities from CVE databases.',
    domain: 'Cybersecurity',
    tech: ['Python', 'HuggingFace', 'AST', 'Docker', 'GitHub API'],
    college: 'IIT Madras',
    year: 2023,
    students: ['Ananya Krishnan', 'Vikram Reddy'],
    stars: 95,
    type: 'Tool',
    github: 'https://github.com/vikramr/bugsniper',
    status: 'published',
  },
  {
    id: 'proj-8',
    title: 'Agriculture Yield Prediction Dashboard',
    description: 'Machine learning system using satellite imagery, soil data, and weather patterns to predict crop yields for 15+ crop types across Indian states. Uses Google Earth Engine for satellite data ingestion, ensemble ML models (Random Forest + XGBoost + LSTM) for predictions, and a Streamlit dashboard for visualization. Predictions are within 8% of actual yields on validation data spanning 3 years.',
    domain: 'Data Science',
    tech: ['Python', 'Scikit-learn', 'Google Earth Engine', 'Streamlit', 'PostgreSQL'],
    college: 'Punjab Agricultural University',
    year: 2024,
    students: ['Gurpreet Singh', 'Harleen Kaur'],
    stars: 56,
    type: 'Research',
    status: 'published',
  },
  {
    id: 'proj-9',
    title: 'Gamified Adaptive Learning Platform for K-12',
    description: 'AI-driven education platform that adapts difficulty level, content format, and pacing based on individual student performance and engagement. Features include interactive quizzes with real-time difficulty adjustment, achievement badges, leaderboards, and visual progress maps. Uses a knowledge graph to model curriculum dependencies and a reinforcement learning agent to optimize learning paths. Piloted with 500 students across 3 schools in Kerala.',
    domain: 'Education',
    tech: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'D3.js'],
    college: 'Amrita University',
    year: 2024,
    students: ['Lakshmi Nair', 'Arun Pillai'],
    stars: 71,
    type: 'Product',
    github: 'https://github.com/lakshmin/learnquest',
    status: 'published',
  },
]

const UPLOADED_KEY = 'ps_uploaded_projects'
const STARRED_KEY = 'ps_starred_projects'
const REVIEW_KEY = 'ps_review_statuses'

/** Get review statuses mapping from localStorage */
export function getReviewStatuses(): Record<string, { status: 'pending' | 'approved' | 'rejected'; comment?: string }> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(REVIEW_KEY) || '{}')
  } catch { return {} }
}

/** Get all user-uploaded projects from localStorage */
export function getUploadedProjects(): Project[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = JSON.parse(localStorage.getItem(UPLOADED_KEY) || '[]')
    const reviews = getReviewStatuses()
    return raw.map((p: Project) => {
      if (reviews[p.id]) {
        const s = reviews[p.id].status
        const newStatus: ProjectStatus = s === 'approved' ? 'published' : s === 'rejected' ? 'rejected' : 'under_review'
        return { ...p, status: newStatus }
      }
      return p
    })
  } catch { return [] }
}

/** Save a new uploaded project */
export function saveUploadedProject(project: Project): void {
  const existing = getUploadedProjects()
  existing.unshift(project) // newest first
  localStorage.setItem(UPLOADED_KEY, JSON.stringify(existing))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'))
}

/** Get ALL projects (samples + uploaded) with status overrides applied */
export function getAllProjects(): Project[] {
  const uploaded = getUploadedProjects()
  const reviews = getReviewStatuses()
  const starredMap = getStarredMap()

  const all = [...uploaded, ...SAMPLE_PROJECTS].map(p => {
    let status = p.status
    if (reviews[p.id]) {
      const s = reviews[p.id].status
      status = s === 'approved' ? 'published' : s === 'rejected' ? 'rejected' : 'under_review'
    }
    const starDelta = starredMap[p.id] ? 1 : 0
    return { ...p, status, stars: p.stars + starDelta }
  })

  return all
}

/** Find a project by ID */
export function getProjectById(id: string): Project | null {
  return getAllProjects().find(p => p.id === id) || null
}

/** Star Management */
export function getStarredMap(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STARRED_KEY) || '{}')
  } catch { return {} }
}

export function isProjectStarred(id: string): boolean {
  const map = getStarredMap()
  return !!map[id]
}

export function toggleStarProject(id: string): boolean {
  if (typeof window === 'undefined') return false
  const map = getStarredMap()
  const isStarred = !map[id]
  map[id] = isStarred
  localStorage.setItem(STARRED_KEY, JSON.stringify(map))
  window.dispatchEvent(new Event('storage'))
  return isStarred
}
