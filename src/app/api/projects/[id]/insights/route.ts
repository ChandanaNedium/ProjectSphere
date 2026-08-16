import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { safeParseJson } from '@/lib/utils'

// GET: Innovation insights for a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Check if insights already exist
  const existing = await prisma.innovationInsight.findFirst({
    where: { projectId: id },
    orderBy: { generatedAt: 'desc' },
  })

  if (existing) {
    return NextResponse.json({
      insight: {
        ...existing,
        repeatedApproaches: safeParseJson<string[]>(existing.repeatedApproaches, []),
        underexploredAreas: safeParseJson<string[]>(existing.underexploredAreas, []),
        researchGaps: safeParseJson<string[]>(existing.researchGaps, []),
        improvements: safeParseJson<string[]>(existing.improvements, []),
        emergingTechs: safeParseJson<string[]>(existing.emergingTechs, []),
      },
      generated: false,
    })
  }

  // Generate insights based on related projects in same domain
  const relatedProjects = await prisma.project.findMany({
    where: {
      domain: project.domain,
      id: { not: id },
      status: { in: ['PUBLISHED', 'APPROVED'] },
    },
    take: 30,
  })

  const insight = generateInsights(project, relatedProjects)

  const saved = await prisma.innovationInsight.create({
    data: {
      projectId: id,
      repeatedApproaches: JSON.stringify(insight.repeatedApproaches),
      underexploredAreas: JSON.stringify(insight.underexploredAreas),
      researchGaps: JSON.stringify(insight.researchGaps),
      improvements: JSON.stringify(insight.improvements),
      emergingTechs: JSON.stringify(insight.emergingTechs),
    },
  })

  return NextResponse.json({ insight: { ...saved, ...insight }, generated: true })
}

function generateInsights(project: any, relatedProjects: any[]) {
  const projectTechs = safeParseJson<string[]>(project.technologies, [])
  const projectTechsLower = projectTechs.map(t => t.toLowerCase())

  // Aggregate technologies and approaches from related projects
  const techCounts: Record<string, number> = {}
  const methodApproaches: string[] = []

  for (const rp of relatedProjects) {
    const techs = safeParseJson<string[]>(rp.technologies, [])
    techs.forEach(t => {
      techCounts[t] = (techCounts[t] || 0) + 1
    })
    if (rp.methodology) methodApproaches.push(rp.methodology)
  }

  const commonTechs = Object.entries(techCounts)
    .filter(([_, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tech]) => tech)

  const rareTechs = Object.entries(techCounts)
    .filter(([_, count]) => count === 1)
    .map(([tech]) => tech)
    .slice(0, 5)

  const cloudKeywords = ['cloud', 'aws', 'azure', 'gcp', 'firebase', 'heroku']
  const edgeKeywords = ['edge', 'raspberry', 'arduino', 'iot', 'embedded', 'tinyml']
  const cloudUsed = projectTechsLower.some(t => cloudKeywords.some(k => t.includes(k)))

  const repeatedApproaches: string[] = []
  const underexploredAreas: string[] = []
  const researchGaps: string[] = []
  const improvements: string[] = []
  const emergingTechs: string[] = []

  // Repeated approaches based on related project patterns
  if (commonTechs.length > 0) {
    repeatedApproaches.push(`Most ${project.domain} projects use: ${commonTechs.join(', ')}`)
  }
  if (cloudUsed) {
    repeatedApproaches.push('Cloud-dependent inference requiring internet connectivity')
  }
  if (relatedProjects.length > 3) {
    repeatedApproaches.push('Centralized server-based architectures without edge capabilities')
    repeatedApproaches.push('English-only user interfaces and documentation')
  }

  // Underexplored based on domain
  const domainInsights: Record<string, { under: string[], gaps: string[], improve: string[], emerging: string[] }> = {
    'Artificial Intelligence': {
      under: ['Offline/edge inference for low-connectivity environments', 'Multilingual accessibility for non-English speakers', 'Federated learning for privacy-preserving training'],
      gaps: ['Very few projects address model adaptation to new geographic regions', 'Limited work on AI fairness and bias mitigation', 'Lack of lightweight models for mobile-first deployment'],
      improve: ['Implement TinyML for offline inference on mobile devices', 'Add multilingual voice interface support', 'Create federated learning system for distributed training', 'Build model explainability dashboard'],
      emerging: ['TinyML / Edge Inference', 'Federated Learning', 'Multimodal Transformers', 'LoRA fine-tuning'],
    },
    'Healthcare': {
      under: ['AI systems for rare diseases with limited data', 'Mental health monitoring and support tools', 'Integration with existing hospital EHR systems'],
      gaps: ['Lack of real-world clinical validation studies', 'No projects address healthcare for elderly or disabled populations specifically', 'Limited work on privacy-preserving medical data sharing'],
      improve: ['Add FDA/regulatory compliance documentation', 'Implement differential privacy for patient data', 'Build integration with HL7 FHIR standard', 'Create physician-facing explainability reports'],
      emerging: ['Federated Learning for Medical Data', 'Digital Twins for Patient Simulation', 'Foundation Models for Healthcare'],
    },
    'Agriculture': {
      under: ['Edge/offline systems for rural deployment', 'Multi-crop and multi-region adaptation', 'Integration with government agricultural databases'],
      gaps: ['Few projects address small-scale/subsistence farming specifically', 'Limited work on soil health longitudinal tracking', 'No projects combine drone + ground sensor fusion'],
      improve: ['Implement TinyML for Raspberry Pi deployment', 'Add regional language voice interface', 'Integrate weather API for predictive analytics', 'Create farmer community knowledge sharing'],
      emerging: ['Precision Agriculture AI', 'Drone Computer Vision', 'Hyperspectral Imaging', 'IoT Soil Sensors'],
    },
    'Smart Cities': {
      under: ['Citizen participation and crowdsourcing systems', 'Cross-department city data integration', 'Emergency response optimization'],
      gaps: ['Lack of digital twin city simulation', 'No projects integrate multiple smart city verticals', 'Limited work on AI-based urban planning assistance'],
      improve: ['Build citizen mobile app for participatory sensing', 'Create cross-system data pipeline with city APIs', 'Add predictive maintenance for city infrastructure', 'Implement carbon footprint tracking'],
      emerging: ['Digital Twin Cities', '5G-enabled Smart Infrastructure', 'AI Urban Planning'],
    },
    'Cybersecurity': {
      under: ['AI-powered zero-day threat detection', 'Explainable AI for security alerts', 'Behavioral biometrics for continuous authentication'],
      gaps: ['Few projects address supply chain security', 'Limited work on AI-generated content detection', 'No projects tackle IoT device security at scale'],
      improve: ['Add real-time threat intelligence integration', 'Implement MITRE ATT&CK framework mapping', 'Build automated incident response playbooks', 'Create adversarial ML robustness testing'],
      emerging: ['LLM-powered Threat Analysis', 'Quantum-resistant Cryptography', 'Zero Trust Architecture'],
    },
    'Education': {
      under: ['Neurodiversity-aware learning systems', 'Teacher workload reduction tools', 'Parent engagement platforms'],
      gaps: ['Limited work on measuring long-term learning retention', 'Few projects address learning in low-resource settings', 'No projects integrate social-emotional learning'],
      improve: ['Add accessibility features for students with disabilities', 'Implement spaced repetition algorithms', 'Create teacher analytics dashboard', 'Build peer-learning collaborative tools'],
      emerging: ['Generative AI Tutors', 'Immersive VR Learning', 'Adaptive Assessment Systems'],
    },
    'FinTech': {
      under: ['Micro-insurance for gig economy workers', 'AI-powered regulatory compliance', 'Cross-border payment optimization'],
      gaps: ['Limited work on financial literacy tools for low-income users', 'Few projects address algorithmic trading fairness', 'No projects tackle unbanked population financial inclusion comprehensively'],
      improve: ['Add regulatory sandbox compliance features', 'Implement AML/KYC automation', 'Build financial health scoring beyond credit', 'Create multilingual interface for rural users'],
      emerging: ['Embedded Finance APIs', 'CBDC Integration', 'RegTech Automation'],
    },
    'IoT': {
      under: ['Interoperability between IoT platforms', 'Energy harvesting for battery-free sensors', 'AI at the edge for real-time processing'],
      gaps: ['Few projects address IoT security and firmware updates at scale', 'Limited work on ultra-low-power sensor design', 'No projects tackle massive IoT device management'],
      improve: ['Implement MQTT over 5G for lower latency', 'Add over-the-air firmware update system', 'Build device digital twin for remote management', 'Create anomaly detection for sensor data streams'],
      emerging: ['Matter Protocol', 'Energy Harvesting', 'TinyML at the Edge'],
    },
  }

  const domainData = domainInsights[project.domain] || domainInsights['Artificial Intelligence']

  underexploredAreas.push(...domainData.under)
  researchGaps.push(...domainData.gaps)
  improvements.push(...domainData.improve)
  emergingTechs.push(...domainData.emerging)

  // Add project-specific insights
  if (rareTechs.length > 0) {
    underexploredAreas.push(`Rarely explored technologies in this domain: ${rareTechs.join(', ')}`)
  }

  if (relatedProjects.length === 0) {
    researchGaps.push(`Very few projects exist in ${project.domain} at this platform — early mover advantage`)
  } else if (relatedProjects.length > 10) {
    researchGaps.push(`High competition in ${project.domain} — focus on unique differentiators to stand out`)
  }

  return {
    repeatedApproaches: repeatedApproaches.slice(0, 4),
    underexploredAreas: underexploredAreas.slice(0, 4),
    researchGaps: researchGaps.slice(0, 4),
    improvements: improvements.slice(0, 5),
    emergingTechs: emergingTechs.slice(0, 4),
  }
}
