'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Globe,
  Database,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart2,
  Lightbulb,
  ExternalLink,
  Download,
  RefreshCw,
  GitBranch,
  BookOpen,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Tag,
  Code2,
  FileText,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { getProjectById, getAllProjects } from '@/lib/projects'
import {
  GlobalSimilarityReport,
  ExternalProjectResult,
  SourceType,
} from '@/lib/global-similarity/types'
import { DOMAINS } from '@/lib/utils'

const DEMO_PROJECT = {
  title: 'AI-Based Smart Waste Segregation using Computer Vision and IoT',
  domain: 'Artificial Intelligence',
  description:
    'An automated smart waste segregation system that combines deep learning computer vision and IoT sensor networks. The system captures overhead camera images of waste at intake chutes, runs lightweight YOLOv8 classification to categorize waste into recyclable, organic, metal, and hazardous streams, and triggers servo-controlled diverter flaps. Ultrasonic bin sensors continuously monitor fill levels and stream telemetry over MQTT to a municipal dashboard for predictive collection route optimization.',
  tech: 'Python, YOLOv8, OpenCV, Raspberry Pi, MQTT, TensorFlow, React, Node.js',
  methodology:
    'Transfer learning with YOLOv8 fine-tuned on custom waste dataset, deployed on Raspberry Pi 4 with camera module, communicating via MQTT broker with ESP32-actuated mechanical diverters.',
  outcome:
    'Achieves 92%+ classification accuracy in under 400ms inference time, reducing manual sorting costs by 45% and optimizing municipal garbage truck fuel consumption.',
}

function getAssessmentStyle(assessment: string | undefined, score: number) {
  if (score >= 80 || assessment === 'STRONG SIMILARITY DETECTED') {
    return {
      color: '#f87171',
      bg: 'rgba(248,113,113,0.12)',
      border: 'rgba(248,113,113,0.3)',
      label: 'Strong Similarity Detected',
      icon: XCircle,
      desc: 'Significant conceptual and technological overlap detected across external repositories and research literature. Direct differentiation is essential.',
    }
  }
  if (score >= 60 || assessment === 'HIGH OBSERVED SIMILARITY') {
    return {
      color: '#fb923c',
      bg: 'rgba(251,146,60,0.12)',
      border: 'rgba(251,146,60,0.3)',
      label: 'High Observed Similarity',
      icon: AlertTriangle,
      desc: 'Substantial similarities found in problem domain and methodology with existing public solutions. Review top matching sources for key differences.',
    }
  }
  if (score >= 35 || assessment === 'MODERATE OBSERVED SIMILARITY') {
    return {
      color: '#fbbf24',
      bg: 'rgba(251,191,36,0.12)',
      border: 'rgba(251,191,36,0.3)',
      label: 'Moderate Observed Similarity',
      icon: AlertTriangle,
      desc: 'Moderate overlap observed in domain and technologies, but your approach retains distinct problem framing and implementation elements.',
    }
  }
  return {
    color: '#34d399',
    bg: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.3)',
    label: 'Low Observed Similarity',
    icon: CheckCircle,
    desc: 'Low observed similarity across analyzed sources. Your project demonstrates strong originality and unique architectural aspects.',
  }
}

function getSourceBadge(source: SourceType) {
  switch (source) {
    case 'GitHub':
      return { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', icon: GitBranch }
    case 'Research Paper':
      return { color: '#c084fc', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.25)', icon: BookOpen }
    case 'Web':
      return { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)', icon: Globe }
    case 'ProjectSphere':
    default:
      return { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.25)', icon: Database }
  }
}

function DimensionBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, value))}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

function SimilarityContent() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'global' | 'local'>('global')
  const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input')

  // Form inputs
  const [title, setTitle] = useState('')
  const [domain, setDomain] = useState('Artificial Intelligence')
  const [description, setDescription] = useState('')
  const [tech, setTech] = useState('')
  const [methodology, setMethodology] = useState('')
  const [outcome, setOutcome] = useState('')

  // Live progress simulation & real state
  const [currentProgressIndex, setCurrentProgressIndex] = useState(0)
  const [globalReport, setGlobalReport] = useState<GlobalSimilarityReport | null>(null)
  const [localReport, setLocalReport] = useState<any>(null)
  const [activeSourceFilter, setActiveSourceFilter] = useState<string>('all')
  const [showQueries, setShowQueries] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Prepopulate if ?ref=... is present in URL
  useEffect(() => {
    const refId = searchParams.get('ref')
    if (refId) {
      const p = getProjectById(refId)
      if (p) {
        setTitle(p.title)
        setDomain(p.domain || 'Artificial Intelligence')
        setDescription(p.description)
        setTech(p.tech.join(', '))
      }
    }
  }, [searchParams])

  const PROGRESS_STEPS = [
    { id: '1', label: 'Extracting structured representation & generating queries' },
    { id: '2', label: 'Searching ProjectSphere internal database' },
    { id: '3', label: 'Querying official GitHub repository search API' },
    { id: '4', label: 'Executing multi-query public web search' },
    { id: '5', label: 'Retrieving peer-reviewed academic literature via OpenAlex' },
    { id: '6', label: 'Deduplicating candidates & computing multi-dimensional vector cosine similarities' },
    { id: '7', label: 'Synthesizing research gap analysis & differentiation report' },
  ]

  const fillDemoProject = () => {
    setTitle(DEMO_PROJECT.title)
    setDomain(DEMO_PROJECT.domain)
    setDescription(DEMO_PROJECT.description)
    setTech(DEMO_PROJECT.tech)
    setMethodology(DEMO_PROJECT.methodology)
    setOutcome(DEMO_PROJECT.outcome)
  }

  const handleRunAnalysis = async () => {
    if (!title.trim() || !description.trim()) return

    setErrorMessage(null)
    setStep('analyzing')
    setCurrentProgressIndex(0)

    // Animated stepper progression interval
    const stepInterval = setInterval(() => {
      setCurrentProgressIndex(prev => (prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev))
    }, 900)

    try {
      if (mode === 'global') {
        const res = await fetch('/api/similarity/global', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            domain,
            description,
            technologies: tech,
            methodology,
            expectedOutcome: outcome,
          }),
        })

        const json = await res.json()
        clearInterval(stepInterval)

        if (json.ok && json.data) {
          setGlobalReport(json.data)
          setCurrentProgressIndex(PROGRESS_STEPS.length - 1)
          setTimeout(() => setStep('result'), 400)
        } else {
          setErrorMessage(json.error || 'Failed to complete global similarity analysis.')
          setStep('input')
        }
      } else {
        // Local Check
        const res = await fetch('/api/similarity/local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            domain,
            description,
            technologies: tech,
            methodology,
          }),
        })

        const json = await res.json()
        clearInterval(stepInterval)

        if (json.ok && json.data) {
          setLocalReport(json.data)
          setCurrentProgressIndex(PROGRESS_STEPS.length - 1)
          setTimeout(() => setStep('result'), 400)
        } else {
          setErrorMessage(json.error || 'Failed to complete local similarity analysis.')
          setStep('input')
        }
      }
    } catch (err: any) {
      clearInterval(stepInterval)
      setErrorMessage(err?.message || 'Network error occurred.')
      setStep('input')
    }
  }

  const handleDownloadReport = () => {
    if (!globalReport) return
    setDownloading(true)

    setTimeout(() => {
      const top3 = globalReport.topMatches.slice(0, 5).map((m, idx) => {
        return `\n${idx + 1}. ${m.title} [${m.source}]\n   Overall Similarity: ${m.similarityScore}%\n   Dimensions: Problem: ${m.dimensionScores.problemScore}%, Method: ${m.dimensionScores.methodologyScore}%, Tech: ${m.dimensionScores.technologyScore}%\n   URL: ${m.sourceUrl}\n   Explanation: ${m.explanation}\n   Similarities: ${m.commonAreas.join(', ')}\n   Differences: ${m.differences.join(', ')}`
      }).join('\n')

      const gaps = globalReport.researchGaps.potentialResearchGaps.map((g, i) => `\n${i + 1}. ${g.gap}\n   Context: ${g.context}\n   Focus: ${g.suggestedFocus}`).join('\n')

      const suggestions = globalReport.differentiationSuggestions.map((s, i) => `\n${i + 1}. ${s}`).join('\n')

      const content = `================================================================================
PROJECTSPHERE GLOBAL SIMILARITY & NOVELTY REPORT
================================================================================
Project Title: ${globalReport.project.title}
Domain: ${globalReport.project.domain}
Generated: ${new Date(globalReport.createdAt).toLocaleString('en-IN')}
Embedding Engine: ${globalReport.embeddingEngine}

--------------------------------------------------------------------------------
1. GLOBAL NOVELTY SUMMARY
--------------------------------------------------------------------------------
Overall Assessment: ${globalReport.overallAssessment}
Highest Match: ${globalReport.highestMatchScore}% (${globalReport.highestMatchSource} - "${globalReport.highestMatchProjectTitle}")
Average Similarity: ${globalReport.averageSimilarity}%

Sources Analyzed:
- ProjectSphere Database: ${globalReport.sourcesAnalyzed.projectSphere} candidates
- GitHub Repositories:    ${globalReport.sourcesAnalyzed.github} candidates
- Public Web Index:       ${globalReport.sourcesAnalyzed.web} candidates
- Research Literature:    ${globalReport.sourcesAnalyzed.research} candidates
- Total Discoveries:      ${globalReport.sourcesAnalyzed.total} candidates

--------------------------------------------------------------------------------
2. SOURCE-WISE BREAKDOWN
--------------------------------------------------------------------------------
${Object.entries(globalReport.sourceBreakdown).map(([src, stats]) => `- ${src.padEnd(16)}: ${stats.count} matches, Highest: ${stats.highestScore}%, Avg: ${stats.averageScore}% ${stats.statusMessage ? `[${stats.statusMessage}]` : ''}`).join('\n')}

--------------------------------------------------------------------------------
3. TOP MATCHING PROJECTS & LITERATURE
--------------------------------------------------------------------------------
${top3}

--------------------------------------------------------------------------------
4. RESEARCH GAP ANALYSIS
--------------------------------------------------------------------------------
${gaps}

--------------------------------------------------------------------------------
5. TAILORED DIFFERENTIATION SUGGESTIONS
--------------------------------------------------------------------------------
${suggestions}

--------------------------------------------------------------------------------
OFFICIAL DISCLAIMER:
${globalReport.disclaimer}
================================================================================`

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `global-similarity-report-${globalReport.project.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.txt`
      a.click()
      URL.revokeObjectURL(url)
      setDownloading(false)
    }, 600)
  }

  const assessment = globalReport
    ? getAssessmentStyle(globalReport.overallAssessment, globalReport.highestMatchScore)
    : localReport
    ? getAssessmentStyle(undefined, localReport.overall)
    : getAssessmentStyle(undefined, 0)

  const filteredMatches = globalReport
    ? activeSourceFilter === 'all'
      ? globalReport.topMatches
      : globalReport.topMatches.filter(m => m.source === activeSourceFilter)
    : []

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 6%)', color: 'hsl(210, 40%, 96%)', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe style={{ width: 24, height: 24, color: '#c084fc' }} />
              </div>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px' }}>Global Similarity & Novelty Checker</h1>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
                  Multi-source global project discovery & semantic vector similarity analysis across ProjectSphere, GitHub, Web, and Academic Research.
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setMode('global')}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                background: mode === 'global' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'transparent',
                color: mode === 'global' ? 'white' : 'rgba(255,255,255,0.5)',
              }}
            >
              <Globe style={{ width: 14, height: 14 }} /> Global Discovery
            </button>
            <button
              onClick={() => setMode('local')}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                background: mode === 'local' ? 'rgba(59,130,246,0.2)' : 'transparent',
                color: mode === 'local' ? '#60a5fa' : 'rgba(255,255,255,0.5)',
              }}
            >
              <Database style={{ width: 14, height: 14 }} /> Local DB Only
            </button>
          </div>
        </div>

        {errorMessage && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, color: '#fca5a5' }}>
            <AlertTriangle style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span style={{ fontSize: 14 }}>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: INPUT FORM */}
        {step === 'input' && (
          <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Quick Demo Pre-fill Banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 16, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  <Sparkles style={{ width: 16, height: 16, color: '#c084fc' }} />
                  <span>Try Sample Realistic Project</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                  Pre-fill with <em>&ldquo;AI-Based Smart Waste Segregation using Computer Vision and IoT&rdquo;</em> to test multi-source discovery.
                </p>
              </div>
              <button
                onClick={fillDemoProject}
                style={{
                  padding: '9px 16px', borderRadius: 8, background: 'rgba(139,92,246,0.2)',
                  border: '1px solid rgba(139,92,246,0.4)', color: '#c084fc', fontSize: 13,
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                Load Sample Project
              </button>
            </div>

            {/* Main Form */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '30px', display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'rgba(255,255,255,0.8)' }}>
                    Project Title *
                  </label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. AI-Based Smart Waste Segregation using Computer Vision and IoT"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', padding: '13px 16px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'rgba(255,255,255,0.8)' }}>
                    Domain *
                  </label>
                  <select
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', padding: '13px 16px', fontSize: 14, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                  >
                    {DOMAINS.map(d => (
                      <option key={d} value={d} style={{ background: '#0d1117' }}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'rgba(255,255,255,0.8)' }}>
                  Detailed Project Description / Abstract *
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the core problem your project addresses, the proposed system architecture, target users, and what makes your approach distinctive..."
                  rows={5}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', padding: '13px 16px', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'rgba(255,255,255,0.8)' }}>
                  Technologies & Frameworks (comma-separated)
                </label>
                <input
                  value={tech}
                  onChange={e => setTech(e.target.value)}
                  placeholder="e.g. Python, YOLOv8, OpenCV, Raspberry Pi, MQTT, PyTorch, React"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', padding: '13px 16px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {mode === 'global' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'rgba(255,255,255,0.8)' }}>
                      Methodology & Architecture (optional)
                    </label>
                    <textarea
                      value={methodology}
                      onChange={e => setMethodology(e.target.value)}
                      placeholder="e.g. Transfer learning with YOLOv8 fine-tuned on custom datasets, deployed on Raspberry Pi 4 edge node..."
                      rows={3}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', padding: '12px 14px', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'rgba(255,255,255,0.8)' }}>
                      Expected Outcomes & Key Scope (optional)
                    </label>
                    <textarea
                      value={outcome}
                      onChange={e => setOutcome(e.target.value)}
                      placeholder="e.g. 92%+ classification accuracy in under 400ms inference time with automated bin telemetry..."
                      rows={3}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', padding: '12px 14px', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {/* Source Checklist Info */}
              {mode === 'global' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)' }}>
                    Sources Queried in this Check:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#38bdf8' }}>
                      <Database style={{ width: 15, height: 15 }} /> ProjectSphere DB
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#60a5fa' }}>
                      <GitBranch style={{ width: 15, height: 15 }} /> GitHub Repos
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#34d399' }}>
                      <Globe style={{ width: 15, height: 15 }} /> Public Web Index
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#c084fc' }}>
                      <BookOpen style={{ width: 15, height: 15 }} /> OpenAlex Papers
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleRunAnalysis}
                disabled={!title.trim() || !description.trim()}
                style={{
                  padding: '16px', borderRadius: 12, fontWeight: 800, fontSize: 15,
                  background: (!title.trim() || !description.trim()) ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  color: 'white', border: 'none', cursor: (!title.trim() || !description.trim()) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 4px 20px rgba(139,92,246,0.35)', transition: 'all 0.2s ease',
                }}
              >
                <Search style={{ width: 18, height: 18 }} />
                {mode === 'global' ? 'Run Global Similarity & Novelty Discovery' : 'Run Local Database Similarity Check'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ANIMATED PROGRESS */}
        {step === 'analyzing' && (
          <div style={{ maxWidth: 860, margin: '40px auto', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '48px 36px', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <RefreshCw style={{ width: 32, height: 32, color: '#c084fc', animation: 'spin 1.5s linear infinite' }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              {mode === 'global' ? 'Performing Global Multi-Source Discovery…' : 'Analyzing Local Similarity…'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 36, maxWidth: 540, margin: '0 auto 36px' }}>
              Extracting structured representations, querying public external APIs, and calculating semantic vector cosine similarities across 5 dimensions.
            </p>

            <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
              {PROGRESS_STEPS.map((s, idx) => {
                const isDone = idx < currentProgressIndex
                const isCurrent = idx === currentProgressIndex
                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10,
                      background: isCurrent ? 'rgba(139,92,246,0.1)' : isDone ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.02)',
                      border: isCurrent ? '1px solid rgba(139,92,246,0.3)' : isDone ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isDone ? (
                        <CheckCircle style={{ width: 18, height: 18, color: '#34d399' }} />
                      ) : isCurrent ? (
                        <RefreshCw style={{ width: 16, height: 16, color: '#c084fc', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                      )}
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'white' : isDone ? '#34d399' : 'rgba(255,255,255,0.4)' }}>
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 3: RESULTS REPORT */}
        {step === 'result' && (
          <div style={{ maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Showing Report for:</span>
                <span style={{ fontWeight: 800, fontSize: 15 }}>{title}</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {globalReport && (
                  <button
                    onClick={handleDownloadReport}
                    disabled={downloading}
                    style={{
                      padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 13,
                      fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <Download style={{ width: 14, height: 14 }} /> {downloading ? 'Preparing…' : 'Export Report (TXT)'}
                  </button>
                )}
                <button
                  onClick={() => setStep('input')}
                  style={{
                    padding: '8px 16px', borderRadius: 8, background: 'rgba(139,92,246,0.15)',
                    border: '1px solid rgba(139,92,246,0.3)', color: '#c084fc', fontSize: 13,
                    fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Modify & Check Another
                </button>
              </div>
            </div>

            {/* Overall Assessment Score Hero Card */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1.5px solid ${assessment.border}`, borderRadius: 20, padding: '32px', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
              <div
                style={{
                  width: 120, height: 120, borderRadius: '50%', flexShrink: 0,
                  background: `conic-gradient(${assessment.color} ${(globalReport?.highestMatchScore || localReport?.overall || 0) * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <div style={{ width: 92, height: 92, borderRadius: '50%', background: 'hsl(222, 47%, 8%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: assessment.color, lineHeight: 1 }}>
                    {globalReport?.highestMatchScore ?? localReport?.overall ?? 0}%
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>highest match</span>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 260 }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>
                  Global Similarity Assessment
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: assessment.color, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <assessment.icon style={{ width: 22, height: 22 }} />
                  {assessment.label}
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 12 }}>
                  {assessment.desc}
                </p>
                {globalReport && (
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                    <span>Average Match: <strong style={{ color: 'white' }}>{globalReport.averageSimilarity}%</strong></span>
                    <span>Total Candidates: <strong style={{ color: 'white' }}>{globalReport.sourcesAnalyzed.total}</strong></span>
                    <span>Embedding Engine: <strong style={{ color: '#c084fc' }}>{globalReport.embeddingEngine.split('(')[0]}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Mandatory Disclaimer Box */}
            <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <ShieldCheck style={{ width: 18, height: 18, color: '#60a5fa', flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                <strong>Official Disclaimer:</strong> {globalReport?.disclaimer || 'Similarity results are based on publicly accessible sources and should be treated as an indication for further review, not as proof of originality or plagiarism.'}
              </p>
            </div>

            {/* Source Breakdown Cards (Global Mode) */}
            {globalReport && (
              <div>
                <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers style={{ width: 18, height: 18, color: '#c084fc' }} /> Multi-Source Discovery Breakdown
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {(['ProjectSphere', 'GitHub', 'Web', 'Research Paper'] as SourceType[]).map(source => {
                    const badge = getSourceBadge(source)
                    const stats = globalReport.sourceBreakdown[source]
                    const highest = stats?.highestScore || 0
                    const count = stats?.count || 0
                    const isSelected = activeSourceFilter === source

                    return (
                      <div
                        key={source}
                        onClick={() => setActiveSourceFilter(isSelected ? 'all' : source)}
                        style={{
                          borderRadius: 14, background: isSelected ? `${badge.color}15` : 'rgba(255,255,255,0.03)',
                          border: isSelected ? `1.5px solid ${badge.color}` : '1px solid rgba(255,255,255,0.08)',
                          padding: '18px', cursor: 'pointer', transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: badge.color, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <badge.icon style={{ width: 14, height: 14 }} /> {source}
                          </span>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                            {count} found
                          </span>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: highest > 0 ? badge.color : 'rgba(255,255,255,0.25)', marginBottom: 4 }}>
                          {highest > 0 ? `${highest}%` : '—'}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                          {stats?.statusMessage || (count > 0 ? `Avg: ${stats.averageScore}% similarity` : 'No close matches')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Generated Search Queries Collapsible */}
            {globalReport && globalReport.queriesExecuted.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px 20px' }}>
                <button
                  onClick={() => setShowQueries(!showQueries)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Code2 style={{ width: 16, height: 16, color: '#60a5fa' }} />
                    Generated Search Queries ({globalReport.queriesExecuted.length})
                  </span>
                  {showQueries ? <ChevronUp style={{ width: 16, height: 16 }} /> : <ChevronDown style={{ width: 16, height: 16 }} />}
                </button>

                {showQueries && (
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {globalReport.queriesExecuted.map((q, idx) => (
                      <div key={idx} style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 12 }}>
                        <div style={{ fontWeight: 700, color: '#93c5fd', marginBottom: 2 }}>&ldquo;{q.query}&rdquo;</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', gap: 12 }}>
                          <span>Perspective: <b>{q.perspective.replace(/_/g, ' ')}</b></span>
                          <span>Target Sources: <b>{q.targetSources.join(', ')}</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Top Matching Projects / Papers */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontWeight: 800, fontSize: 18 }}>
                  Top Matching Discoveries ({filteredMatches.length > 0 ? filteredMatches.length : (localReport?.similar?.length || 0)})
                </h3>
                {globalReport && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['all', 'ProjectSphere', 'GitHub', 'Web', 'Research Paper'].map(src => (
                      <button
                        key={src}
                        onClick={() => setActiveSourceFilter(src)}
                        style={{
                          padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: activeSourceFilter === src ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                          color: activeSourceFilter === src ? 'white' : 'rgba(255,255,255,0.5)',
                          border: 'none', cursor: 'pointer',
                        }}
                      >
                        {src === 'all' ? 'All Sources' : src}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Candidates List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {globalReport && filteredMatches.map((match: ExternalProjectResult) => {
                  const badge = getSourceBadge(match.source)
                  const matchStyle = getAssessmentStyle(undefined, match.similarityScore)

                  return (
                    <div
                      key={match.id}
                      style={{
                        borderRadius: 16, background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)', padding: '24px',
                        display: 'flex', flexDirection: 'column', gap: 18,
                      }}
                    >
                      {/* Top row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 280 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, display: 'flex', alignItems: 'center', gap: 5 }}>
                              <badge.icon style={{ width: 12, height: 12 }} /> {match.source}
                            </span>
                            {match.institutionOrVenue && (
                              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                                {match.institutionOrVenue}
                              </span>
                            )}
                            {match.date && (
                              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                                · {match.date}
                              </span>
                            )}
                          </div>
                          <h4 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6, lineHeight: 1.4 }}>
                            {match.title}
                          </h4>
                          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
                            {match.description}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                          <div style={{ padding: '8px 14px', borderRadius: 10, background: matchStyle.bg, border: `1px solid ${matchStyle.border}`, textAlign: 'center' }}>
                            <div style={{ fontSize: 22, fontWeight: 900, color: matchStyle.color, lineHeight: 1 }}>
                              {match.similarityScore}%
                            </div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: matchStyle.color, marginTop: 2 }}>similarity</div>
                          </div>

                          <a
                            href={match.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                              borderRadius: 8, background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
                              fontSize: 12, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(59,130,246,0.2)',
                            }}
                          >
                            Open Source <ExternalLink style={{ width: 13, height: 13 }} />
                          </a>
                        </div>
                      </div>

                      {/* Dimension mini bars */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
                        <DimensionBar label="Problem (35%)" value={match.dimensionScores.problemScore} color="#60a5fa" />
                        <DimensionBar label="Method (25%)" value={match.dimensionScores.methodologyScore} color="#c084fc" />
                        <DimensionBar label="Tech (20%)" value={match.dimensionScores.technologyScore} color="#34d399" />
                        <DimensionBar label="Domain (10%)" value={match.dimensionScores.domainScore} color="#fbbf24" />
                        <DimensionBar label="Outcome (10%)" value={match.dimensionScores.outcomeScore} color="#f472b6" />
                      </div>

                      {/* Explanation & Concepts */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={{ background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 10, padding: '12px 16px' }}>
                          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#34d399', marginBottom: 6 }}>
                            Similar Concepts
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {match.commonAreas.map((area, i) => (
                              <span key={i} style={{ padding: '3px 8px', borderRadius: 5, fontSize: 11, background: 'rgba(52,211,153,0.1)', color: '#6ee7b7' }}>
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div style={{ background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 10, padding: '12px 16px' }}>
                          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#60a5fa', marginBottom: 6 }}>
                            Different / Unique Concepts
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {match.differences.map((diff, i) => (
                              <span key={i} style={{ padding: '3px 8px', borderRadius: 5, fontSize: 11, background: 'rgba(96,165,250,0.1)', color: '#93c5fd' }}>
                                {diff}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Contextual Rationale */}
                      <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, background: 'rgba(255,255,255,0.015)', padding: '10px 14px', borderRadius: 8 }}>
                        💡 <strong>Semantic Analysis:</strong> {match.explanation}
                      </div>
                    </div>
                  )
                })}

                {/* Local Fallback View */}
                {!globalReport && localReport && localReport.similar.map((p: any) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{p.college} · {p.year}</div>
                      {p.explanation && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>{p.explanation}</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#fbbf24' }}>{p.overallSim}%</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>similar</div>
                    </div>
                    <Link href={`/project/${p.id}`} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: 12, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(59,130,246,0.2)' }}>
                      View Project
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Research Gap Analysis (Global Mode) */}
            {globalReport && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <Lightbulb style={{ width: 22, height: 22, color: '#fbbf24' }} />
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: 17, margin: 0 }}>Research Gap Analysis from Analyzed Literature</h3>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Synthesized from retrieved academic papers, GitHub projects, and web search results.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {globalReport.researchGaps.potentialResearchGaps.map((gap, i) => (
                    <div key={i} style={{ padding: '16px', borderRadius: 12, background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.15)' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#fde047', marginBottom: 4 }}>
                        🔍 {gap.gap}
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginBottom: 8 }}>
                        {gap.context}
                      </div>
                      <div style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>
                        💡 <strong>Suggested Focus:</strong> {gap.suggestedFocus}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tailored Differentiation Suggestions */}
            {globalReport && (
              <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.08))', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 18, padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <Sparkles style={{ width: 22, height: 22, color: '#c084fc' }} />
                  <h3 style={{ fontWeight: 800, fontSize: 17, margin: 0 }}>Practical Differentiation Strategies for Your Project</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {globalReport.differentiationSuggestions.map((sug, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 13.5, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(139,92,246,0.2)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>
                        {i + 1}
                      </span>
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function SimilarityPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: 'white' }}>Loading Similarity Checker…</div>}>
      <SimilarityContent />
    </Suspense>
  )
}
