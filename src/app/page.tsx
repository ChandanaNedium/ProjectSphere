import Link from 'next/link'
import { ArrowRight, Search, GitCompare, Lightbulb, Users, TrendingUp, Shield, ChevronRight, Network, BookOpen, Zap, Star, Globe } from 'lucide-react'

const stats = [
  { label: 'Projects', value: '1,200+', icon: BookOpen, color: 'text-blue-400' },
  { label: 'Institutions', value: '50+', icon: Globe, color: 'text-indigo-400' },
  { label: 'Domains', value: '15+', icon: Network, color: 'text-purple-400' },
  { label: 'Collaborations', value: '340+', icon: Users, color: 'text-teal-400' },
  { label: 'Students', value: '8,000+', icon: TrendingUp, color: 'text-emerald-400' },
]

const capabilities = [
  {
    icon: Search,
    title: 'Smart Project Search',
    description: 'Search using natural language. Find projects by problem, technology, domain, or concept. AI-powered ranking surfaces the most relevant results.',
    color: 'from-blue-500/10 to-blue-600/5',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: GitCompare,
    title: 'Similarity Detection',
    description: 'Automatically compare your project with thousands of existing projects. Understand overlap in problem domain, methodology, and technology.',
    color: 'from-orange-500/10 to-orange-600/5',
    border: 'border-orange-500/20',
    iconColor: 'text-orange-400',
  },
  {
    icon: Lightbulb,
    title: 'Innovation Insights',
    description: 'Identify what has been over-explored and what gaps remain. Discover research opportunities and emerging technologies in your domain.',
    color: 'from-amber-500/10 to-amber-600/5',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: TrendingUp,
    title: 'AI Recommendations',
    description: 'Get personalized project recommendations based on your skills, domain interests, and learning goals. Discover what to build next.',
    color: 'from-purple-500/10 to-purple-600/5',
    border: 'border-purple-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: Users,
    title: 'Cross-College Collaboration',
    description: 'Find students at other institutions with complementary skills. Send collaboration requests and build cross-institutional teams.',
    color: 'from-teal-500/10 to-teal-600/5',
    border: 'border-teal-500/20',
    iconColor: 'text-teal-400',
  },
  {
    icon: Shield,
    title: 'Originality Reports',
    description: 'Detailed originality analysis showing text similarity, methodology overlap, and technology overlap with clear, non-accusatory language.',
    color: 'from-emerald-500/10 to-emerald-600/5',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
]

const steps = [
  { step: '01', title: 'Discover', desc: 'Search thousands of student projects using natural language queries across institutions.', color: 'bg-blue-500' },
  { step: '02', title: 'Compare', desc: 'Side-by-side comparison of 2–3 projects across domain, tech, methodology and outcomes.', color: 'bg-indigo-500' },
  { step: '03', title: 'Check', desc: 'Run similarity analysis to understand how your project relates to existing work.', color: 'bg-purple-500' },
  { step: '04', title: 'Improve', desc: 'Use AI innovation insights to identify gaps and differentiate your approach.', color: 'bg-violet-500' },
  { step: '05', title: 'Collaborate', desc: 'Connect with students at other institutions who have complementary expertise.', color: 'bg-teal-500' },
  { step: '06', title: 'Innovate', desc: 'Build something genuinely new. Publish, get faculty reviewed, and inspire others.', color: 'bg-emerald-500' },
]

const testimonials = [
  { name: 'Priya Sharma', role: 'CS Student, IIT Delhi', text: 'Found 3 similar projects before starting mine — saved weeks of duplicated effort!', avatar: 'PS' },
  { name: 'Rahul Mehta', role: 'ECE, NIT Trichy', text: 'Collaboration feature connected me with a team from Pune. Built something amazing together.', avatar: 'RM' },
  { name: 'Ananya Iyer', role: 'Data Science, BITS Pilani', text: 'The similarity checker gave me confidence my research idea was genuinely original.', avatar: 'AI' },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 6%)', color: 'hsl(210, 40%, 96%)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,13,20,0.85)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Network style={{ width: 18, height: 18, color: 'white' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>ProjectSphere</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/explore" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}>Explore</Link>
            <Link href="/about" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>About</Link>
            <Link href="/login" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/register" style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              background: '#3b82f6', color: 'white', textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
            }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', paddingTop: 140, paddingBottom: 100, paddingLeft: 24, paddingRight: 24, overflow: 'hidden' }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '15%', width: 500, height: 500, background: 'rgba(59,130,246,0.08)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '10%', width: 400, height: 400, background: 'rgba(99,102,241,0.06)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '40%', width: 500, height: 300, background: 'rgba(139,92,246,0.05)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
            borderRadius: 999, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
            color: '#60a5fa', fontSize: 13, fontWeight: 600, marginBottom: 28,
          }}>
            <Zap style={{ width: 13, height: 13 }} />
            AI-Powered Student Project Platform
          </div>

          <h1 style={{ fontSize: 64, fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 24 }}>
            Turn Student Projects Into a{' '}
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Connected Knowledge Ecosystem
            </span>
          </h1>

          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.55)', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Discover existing projects, check originality, identify innovation opportunities, and collaborate across institutions — everything in one intelligent platform.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 60 }}>
            <Link href="/explore" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#3b82f6', color: 'white', fontWeight: 700, fontSize: 15,
              padding: '14px 28px', borderRadius: 12, textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              <Search style={{ width: 16, height: 16 }} />
              Explore Projects
            </Link>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'white', fontWeight: 700, fontSize: 15,
              padding: '14px 28px', borderRadius: 12, textDecoration: 'none',
            }}>
              Upload Your Project
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>

          {/* Flow */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
            {['Colleges', 'ProjectSphere', 'Discover', 'Analyze', 'Collaborate', 'Innovate'].map((item, i, arr) => (
              <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  padding: '6px 14px', borderRadius: 8,
                  background: item === 'ProjectSphere' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)',
                  border: item === 'ProjectSphere' ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  color: item === 'ProjectSphere' ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                }}>{item}</span>
                {i < arr.length - 1 && <ChevronRight style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.2)' }} />}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 40 }}>
            Platform Statistics — Demo Data
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24 }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 6 }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>How It Works</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>A complete workflow from project discovery to innovation and collaboration</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {steps.map((step) => (
              <div key={step.step} style={{
                padding: '28px', borderRadius: 16,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                transition: 'border-color 0.2s, transform 0.2s',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: step.color === 'bg-blue-500' ? '#3b82f6' : step.color === 'bg-indigo-500' ? '#6366f1' : step.color === 'bg-purple-500' ? '#8b5cf6' : step.color === 'bg-violet-500' ? '#7c3aed' : step.color === 'bg-teal-500' ? '#14b8a6' : '#10b981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 12, fontWeight: 800, marginBottom: 16,
                }}>
                  {step.step}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>Key Capabilities</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>Everything you need to turn student projects into a living knowledge ecosystem</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {capabilities.map((cap) => (
              <div key={cap.title} style={{
                padding: '28px', borderRadius: 16,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                transition: 'transform 0.2s, border-color 0.2s',
              }}>
                <cap.icon style={{ width: 32, height: 32, color: cap.iconColor === 'text-blue-400' ? '#60a5fa' : cap.iconColor === 'text-orange-400' ? '#fb923c' : cap.iconColor === 'text-amber-400' ? '#fbbf24' : cap.iconColor === 'text-purple-400' ? '#c084fc' : cap.iconColor === 'text-teal-400' ? '#2dd4bf' : '#34d399', marginBottom: 16 }} />
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{cap.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>Loved by Students</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16 }}>What early users are saying about ProjectSphere</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {testimonials.map((t) => (
              <div key={t.name} style={{
                padding: '28px', borderRadius: 16,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} style={{ width: 14, height: 14, color: '#fbbf24', fill: '#fbbf24' }} />)}
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: 'white',
                  }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 24px', background: 'rgba(59,130,246,0.05)', borderTop: '1px solid rgba(59,130,246,0.1)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 20 }}>
            Ready to build something{' '}
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>original?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17, marginBottom: 40, lineHeight: 1.7 }}>Join thousands of students discovering, sharing, and collaborating on academic projects.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              background: '#3b82f6', color: 'white', fontWeight: 700, fontSize: 15,
              padding: '14px 32px', borderRadius: 12, textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
            }}>Create Free Account</Link>
            <Link href="/explore" style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
              color: 'white', fontWeight: 700, fontSize: 15,
              padding: '14px 32px', borderRadius: 12, textDecoration: 'none',
            }}>Browse Projects</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Network style={{ width: 14, height: 14, color: 'white' }} />
            </div>
            <span style={{ fontWeight: 700 }}>ProjectSphere</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>— Discover. Learn. Collaborate. Innovate.</span>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
            <Link href="/explore" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Explore</Link>
            <Link href="/about" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>About</Link>
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Sign In</Link>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '20px auto 0', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
          © 2024 ProjectSphere. Built for students, by students.
        </div>
      </footer>
    </div>
  )
}
