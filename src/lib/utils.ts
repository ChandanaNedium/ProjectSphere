import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeParseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return formatDate(date)
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getSimilarityColor(score: number): string {
  if (score >= 0.8) return 'text-red-500'
  if (score >= 0.6) return 'text-orange-500'
  if (score >= 0.4) return 'text-yellow-500'
  return 'text-green-500'
}

export function getSimilarityLabel(score: number): string {
  if (score >= 0.8) return 'High'
  if (score >= 0.6) return 'Moderate-High'
  if (score >= 0.4) return 'Moderate'
  return 'Low'
}

export function getSimilarityBadgeVariant(score: number): 'destructive' | 'warning' | 'secondary' | 'outline' {
  if (score >= 0.8) return 'destructive'
  if (score >= 0.6) return 'warning'
  if (score >= 0.4) return 'secondary'
  return 'outline'
}

export const DOMAINS = [
  'Artificial Intelligence',
  'Healthcare',
  'Agriculture',
  'Smart Cities',
  'Cybersecurity',
  'Education',
  'FinTech',
  'Robotics',
  'Sustainability',
  'IoT',
  'Blockchain',
  'Data Science',
  'Cloud Computing',
  'Augmented Reality',
  'Other',
]

export const TECHNOLOGIES = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Next.js',
  'TensorFlow', 'PyTorch', 'Keras', 'OpenCV', 'FastAPI', 'Django', 'Flask',
  'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'MySQL',
  'React Native', 'Flutter', 'Android', 'iOS',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
  'Arduino', 'Raspberry Pi', 'MQTT', 'LoRa',
  'Solidity', 'Ethereum', 'BERT', 'Transformers', 'spaCy',
  'Apache Kafka', 'Spark', 'Hadoop', 'Elasticsearch',
  'ROS', 'SLAM', 'YOLO', 'GAN', 'Reinforcement Learning',
]

export const SKILLS = [
  'Machine Learning', 'Deep Learning', 'Computer Vision', 'NLP',
  'Data Analysis', 'Data Visualization', 'Web Development', 'Mobile Development',
  'IoT', 'Embedded Systems', 'Robotics', 'Blockchain', 'Cloud Computing',
  'Cybersecurity', 'DevOps', 'UI/UX Design', 'Research', 'Technical Writing',
  'Project Management', 'Agile', 'Full Stack', 'Backend', 'Frontend',
]

export const PROJECT_TYPES = [
  'Academic Research', 'Final Year Project', 'Mini Project',
  'Capstone Project', 'Internship Project', 'Hackathon Project',
  'Open Source', 'Product Prototype', 'Industry Collaboration',
]
