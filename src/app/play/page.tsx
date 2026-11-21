import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Play' }

const GAME_MODES = [
  {
    id: 'classic',
    name: 'Classic Draft',
    tagline: 'The Full Experience',
    desc: 'Draft your player, build a career from high school through college and into the pros. Every season matters. Every decision shapes your legacy.',
    accent: '#f97316',
    badge: 'MOST POPULAR',
    badgeColor: 'badge-orange',
    icon: TrophyIcon,
    stats: ['14 Game Seasons', 'Full Career Arc', 'Unlimited Saves'],
  },
  {
    id: 'daily',
    name: 'Daily Draft',
    tagline: 'Fresh Every Day',
    desc: 'A new challenge drops every 24 hours. Compete globally with the same seed. Climb the daily leaderboard and earn exclusive rewards.',
    accent: '#3b82f6',
    badge: 'COMPETITIVE',
    badgeColor: 'badge-navy',
    icon: DailyIcon,
    stats: ['Resets Daily', 'Global Rankings', 'Daily Rewards'],
  },
  {
    id: 'position',
    name: 'Position Draft',
    tagline: 'Master Your Role',
    desc: 'Go deep on a single position. Specialize in position-specific attributes, unlock unique archetypes, and become the ultimate specialist.',
    accent: '#22c55e',
    badge: 'SPECIALIST',
    badgeColor: 'badge-green',
    icon: PositionIcon,
    stats: ['12 Positions', 'Deep Attributes', 'Unique Archetypes'],
  },
  {
    id: 'challenge',
    name: 'Challenge Mode',
    tagline: 'Beat the Constraints',
    desc: 'Draft with special rules — limited spins, attribute restrictions, or position locks. Overcome the challenge and earn rare rewards.',
    accent: '#f59e0b',
    badge: 'HARD MODE',
    badgeColor: 'badge-gold',
    icon: ChallengeIcon,
    stats: ['Weekly Rotations', 'Rare Rewards', 'Leaderboards'],
  },
  {
    id: 'sandbox',
    name: 'Sandbox',
    tagline: 'No Rules. Pure Creativity.',
    desc: 'Experiment freely. Unlimited spins, any position, any attributes. Build your dream player without any restrictions.',
    accent: '#8b5cf6',
    badge: 'FREE PLAY',
    badgeColor: 'badge-navy',
    icon: SandboxIcon,
    stats: ['Unlimited Spins', 'Any Position', 'No Restrictions'],
  },
]

export default async function PlayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let activeCareer: any = null
  if (user) {
    const { data } = await supabase
      .from('careers')
      .select('*, players(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    activeCareer = data
  }

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--orange-400)', marginBottom: '0.4rem' }}>
          Game Modes
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2rem,4vw,3rem)', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.5rem' }}>
          Choose Your <span style={{ color: 'var(--orange-500)' }}>Mode</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 500 }}>Every mode, one goal — build a legend. Pick how you want to play.</p>
      </div>

      {/* Active career banner */}
      {activeCareer && (
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--orange-500)', background: 'rgba(249,115,22,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--orange-400)', marginBottom: '0.2rem' }}>⚡ Active Career</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              {activeCareer.players?.name || 'Your Player'} · {activeCareer.players?.position || 'QB'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Season {activeCareer.season || 1} · {activeCareer.stage || 'College'} · OVR {activeCareer.players?.overall || 70}
            </div>
          </div>
          <Link href={`/career/${activeCareer.id}`} className="btn btn-primary">Continue Career →</Link>
        </div>
      )}

      {/* Featured mode (Classic) — large card */}
      <div style={{ marginBottom: '1.5rem' }}>
        {GAME_MODES.slice(0, 1).map(mode => {
          const Icon = mode.icon
          return (
            <div key={mode.id} className="card" style={{
              padding: '2rem',
              background: `linear-gradient(135deg, var(--navy-800) 0%, rgba(249,115,22,0.06) 100%)`,
              borderTop: `4px solid ${mode.accent}`,
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Background pattern */}
              <div style={{
                position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%',
                background: `radial-gradient(ellipse at right, ${mode.accent}0a 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: `${mode.accent}1a`, border: `1px solid ${mode.accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon color={mode.accent} size={24} />
                    </div>
                    <div>
                      <span className={`badge ${mode.badgeColor}`} style={{ fontSize: '0.6rem' }}>{mode.badge}</span>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--text-primary)', lineHeight: 1 }}>
                        {mode.name}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: mode.accent, marginBottom: '0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {mode.tagline}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem', maxWidth: 440 }}>
                    {mode.desc}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    {mode.stats.map(s => (
                      <div key={s} className="badge badge-navy">{s}</div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link href="/create-player" className="btn btn-primary btn-lg">
                      Play Now →
                    </Link>
                    <Link href={`/play/${mode.id}`} className="btn btn-ghost btn-lg">Learn More</Link>
                  </div>
                </div>

                {/* Field preview art */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ClassicModeSVG />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Other modes grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {GAME_MODES.slice(1).map(mode => {
          const Icon = mode.icon
          return (
            <div key={mode.id} className="card card-hover" style={{
              padding: '1.5rem', borderTop: `3px solid ${mode.accent}`,
              background: 'var(--navy-900)', cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: `${mode.accent}1a`, border: `1px solid ${mode.accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon color={mode.accent} size={20} />
                </div>
                <div>
                  <span className={`badge ${mode.badgeColor}`} style={{ fontSize: '0.55rem' }}>{mode.badge}</span>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1 }}>
                    {mode.name}
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', color: mode.accent, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {mode.tagline}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                {mode.desc}
              </p>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {mode.stats.map(s => (
                  <div key={s} className="badge badge-navy" style={{ fontSize: '0.6rem' }}>{s}</div>
                ))}
              </div>
              <Link href="/create-player" className="btn btn-ghost btn-sm">
                Play {mode.name} →
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── SVG ICONS ── */

function TrophyIcon({ color = '#f97316', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 4h12v8a6 6 0 01-12 0V4z" stroke={color} strokeWidth="1.8" fill={`${color}20`}/>
      <path d="M6 7H3a3 3 0 003 3M18 7h3a3 3 0 01-3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 18v3M9 21h6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function DailyIcon({ color = '#3b82f6', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="17" rx="2" stroke={color} strokeWidth="1.8" fill={`${color}15`}/>
      <path d="M8 2v2M16 2v2M3 10h18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function PositionIcon({ color = '#22c55e', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" fill={`${color}20`}/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function ChallengeIcon({ color = '#f59e0b', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M13 2L4 14h8l-1 8 9-12h-8l1-8z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={`${color}20`}/>
    </svg>
  )
}

function SandboxIcon({ color = '#8b5cf6', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 20V4M4 12h16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill={`${color}10`}/>
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" fill={`${color}30`}/>
    </svg>
  )
}

function ClassicModeSVG() {
  /* Football field top-down view */
  return (
    <svg width="220" height="160" viewBox="0 0 220 160" fill="none">
      {/* Field */}
      <rect x="10" y="10" width="200" height="140" rx="6" fill="rgba(34,197,94,0.07)" stroke="rgba(34,197,94,0.15)" strokeWidth="1.5"/>
      {/* Yard lines */}
      {[40, 70, 110, 150, 180].map(x => (
        <line key={x} x1={x} y1="10" x2={x} y2="150" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      ))}
      {/* End zones */}
      <rect x="10" y="10" width="30" height="140" rx="6" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.15)" strokeWidth="1"/>
      <rect x="180" y="10" width="30" height="140" rx="6" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.15)" strokeWidth="1"/>
      {/* Center circle */}
      <circle cx="110" cy="80" r="20" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none"/>
      {/* Player positions (dots) */}
      <circle cx="110" cy="80" r="4" fill="var(--orange-500)"/>
      <circle cx="90" cy="72" r="3" fill="rgba(255,255,255,0.4)"/>
      <circle cx="90" cy="88" r="3" fill="rgba(255,255,255,0.4)"/>
      <circle cx="80" cy="80" r="3" fill="rgba(255,255,255,0.4)"/>
      <circle cx="75" cy="68" r="3" fill="rgba(255,255,255,0.4)"/>
      <circle cx="75" cy="92" r="3" fill="rgba(255,255,255,0.4)"/>
      <circle cx="130" cy="72" r="3" fill="rgba(59,130,246,0.6)"/>
      <circle cx="130" cy="88" r="3" fill="rgba(59,130,246,0.6)"/>
      <circle cx="140" cy="80" r="3" fill="rgba(59,130,246,0.6)"/>
      <circle cx="145" cy="68" r="3" fill="rgba(59,130,246,0.6)"/>
      <circle cx="145" cy="92" r="3" fill="rgba(59,130,246,0.6)"/>
      {/* Route arrows */}
      <path d="M110 80 C120 60 140 55 155 50" stroke="rgba(249,115,22,0.6)" strokeWidth="1.5" fill="none" strokeDasharray="4 3"/>
      <path d="M110 80 C115 100 130 108 145 112" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5" fill="none" strokeDasharray="4 3"/>
      {/* DD label */}
      <text x="110" y="145" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="700" fontSize="10" fill="rgba(249,115,22,0.4)" letterSpacing="0.1em">DRAFT DAY</text>
    </svg>
  )
}
