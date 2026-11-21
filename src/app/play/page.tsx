import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Play · Draft Day' }

type GameMode = {
  id: string
  title: string
  subtitle: string
  desc: string
  players: string
  difficulty: 'ROOKIE' | 'PRO' | 'LEGEND'
  xp: string
  tag?: string
  href: string
  primaryColor: string
  secondaryColor: string
}

const MODES: GameMode[] = [
  {
    id: 'quick-draft',
    title: 'QUICK DRAFT',
    subtitle: 'Build a team, play now',
    desc: 'Draft a squad from a random pool and jump into fast-paced action. No preparation needed — pure instinct and luck.',
    players: '1v1',
    difficulty: 'ROOKIE',
    xp: '+150 XP',
    tag: 'QUICK PLAY',
    href: '/draft',
    primaryColor: '#22c55e',
    secondaryColor: '#16a34a',
  },
  {
    id: 'ranked',
    title: 'RANKED MATCH',
    subtitle: 'Climb the leaderboards',
    desc: 'Compete in a structured ranked ladder. Build your roster carefully — losses count. Rise from Bronze to Diamond.',
    players: '1v1',
    difficulty: 'PRO',
    xp: '+500 XP',
    tag: 'COMPETITIVE',
    href: '/ranked',
    primaryColor: '#f97316',
    secondaryColor: '#ea580c',
  },
  {
    id: 'career',
    title: 'CAREER MODE',
    subtitle: 'Build a dynasty',
    desc: 'Start as an undrafted rookie and build your legacy over multiple seasons. Contracts, trades, retirements — it\'s the full journey.',
    players: 'Solo',
    difficulty: 'LEGEND',
    xp: '+1,000 XP',
    tag: 'FEATURED',
    href: '/career',
    primaryColor: '#a855f7',
    secondaryColor: '#9333ea',
  },
  {
    id: 'tournament',
    title: 'TOURNAMENT',
    subtitle: 'Weekly championships',
    desc: 'Compete in time-limited tournaments with prizes. Each week a new format: snake draft, auction, mystery positions.',
    players: '8-32 players',
    difficulty: 'PRO',
    xp: '+800 XP',
    href: '/tournament',
    primaryColor: '#f59e0b',
    secondaryColor: '#d97706',
  },
  {
    id: 'training',
    title: 'TRAINING GROUNDS',
    subtitle: 'Sharpen your skills',
    desc: 'Practice draft strategies in a no-stakes sandbox. Experiment with new positions, test attribute combos, and optimize your build.',
    players: 'Solo',
    difficulty: 'ROOKIE',
    xp: '+75 XP',
    href: '/training',
    primaryColor: '#3b82f6',
    secondaryColor: '#2563eb',
  },
  {
    id: 'blitz',
    title: 'BLITZ MODE',
    subtitle: '5-minute fast draft',
    desc: 'Speed drafting under pressure. 15 seconds per pick. No time to overthink — trust your gut and build fast.',
    players: '1v1',
    difficulty: 'PRO',
    xp: '+300 XP',
    tag: 'FAST',
    href: '/blitz',
    primaryColor: '#ec4899',
    secondaryColor: '#db2777',
  },
]

const DIFFICULTY_COLOR = {
  ROOKIE: '#22c55e',
  PRO:    '#f97316',
  LEGEND: '#a855f7',
}

function FieldSVG({ color = '#f97316' }: { color?: string }) {
  return (
    <svg width="160" height="100" viewBox="0 0 160 100" fill="none" style={{ opacity: 0.6 }}>
      {/* Field */}
      <rect x="10" y="20" width="140" height="60" rx="4" stroke={color} strokeWidth="1" fill={`${color}08`}/>
      {/* Yard lines */}
      {[35,60,85,110,135].map(x => (
        <line key={x} x1={x} y1="20" x2={x} y2="80" stroke={`${color}30`} strokeWidth="0.8" strokeDasharray="4 2"/>
      ))}
      {/* Yard numbers */}
      {[['20',35],['50',60],['20',85]].map(([n, x]) => (
        <text key={String(x)} x={x} y="90" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="700" fontSize="8" fill={`${color}40`}>{n}</text>
      ))}
      {/* End zones */}
      <rect x="10" y="20" width="22" height="60" rx="4" fill={`${color}12`}/>
      <rect x="128" y="20" width="22" height="60" rx="4" fill={`${color}12`}/>
      {/* Players (xs and os) */}
      {[[55,40],[65,50],[55,60],[75,45],[75,55]].map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={`${color}40`} stroke={`${color}70`} strokeWidth="0.8"/>
      ))}
      {[[85,40],[95,50],[85,60],[105,45],[105,55]].map(([x,y], i) => (
        <circle key={i+5} cx={x} cy={y} r="4" stroke={`${color}50`} strokeWidth="1" fill="none"/>
      ))}
      {/* Ball */}
      <ellipse cx="80" cy="50" rx="5" ry="3" fill={color} opacity="0.5"/>
    </svg>
  )
}

function TrophySVG({ color = '#f59e0b' }: { color?: string }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ opacity: 0.7 }}>
      <path d="M28 16h24v24c0 8.8-7.2 16-16 16s-16-7.2-16-16V16z" stroke={color} strokeWidth="2" fill={`${color}15`}/>
      <path d="M20 20c-6.6 0-8 10-8 10s4 2 8 2M60 20c6.6 0 8 10 8 10s-4 2-8 2" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M36 56v10M44 56v10M28 66h24" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M34 32l2 4 4.5-6 4 6 2-4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function LightningSVG({ color = '#f97316' }: { color?: string }) {
  return (
    <svg width="60" height="80" viewBox="0 0 60 80" fill="none" style={{ opacity: 0.7 }}>
      <path d="M36 8L12 44h20L16 76l36-40H32L36 8z" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

export default async function PlayPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profileData } = await supabase.from('profiles').select('level, xp').eq('id', user.id).single()
  const profile = profileData as { level: number; xp: number } | null

  const featured = MODES.find(m => m.tag === 'FEATURED') ?? MODES[0]
  const others = MODES.filter(m => m.id !== featured.id)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-950)' }}>

      {/* PAGE HEADER */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #05080f 0%, #0a1020 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '2.5rem 2rem 2rem',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'repeating-linear-gradient(90deg, white 0, white 1px, transparent 1px, transparent 60px), repeating-linear-gradient(0deg, white 0, white 1px, transparent 1px, transparent 60px)' }}/>
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem,5vw,3.5rem)', lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'white' }}>
                GAME MODES
              </h1>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '8px', letterSpacing: '0.04em' }}>
                SELECT A MODE AND GET IN THE GAME
              </div>
            </div>
            {profile && (
              <div style={{
                padding: '12px 18px',
                background: 'rgba(249,115,22,0.08)',
                border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: '12px',
              }}>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '22px', color: '#f97316', lineHeight: 1 }}>
                  LVL {profile.level ?? 1}
                </div>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.08em', color: 'rgba(249,115,22,0.6)', textTransform: 'uppercase' }}>
                  YOUR LEVEL
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem 4rem' }}>

        {/* FEATURED MODE — full width spotlight */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: featured.primaryColor }}/>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>FEATURED MODE</span>
            <div style={{ flex: 1, height: '1px', background: `${featured.primaryColor}20` }}/>
          </div>

          <Link href={featured.href} style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
              padding: '36px 40px',
              background: `linear-gradient(135deg, ${featured.primaryColor}12 0%, ${featured.secondaryColor}08 50%, rgba(5,8,15,0.6) 100%)`,
              border: `1px solid ${featured.primaryColor}30`,
              borderRadius: '24px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}>
              {/* Background glow */}
              <div style={{ position: 'absolute', top: '-80px', right: '5%', width: '350px', height: '350px', borderRadius: '50%', background: `radial-gradient(ellipse, ${featured.primaryColor}15 0%, transparent 70%)`, pointerEvents: 'none' }}/>

              {/* SVG art */}
              <div style={{ flexShrink: 0, opacity: 0.8 }}>
                <TrophySVG color={featured.primaryColor}/>
              </div>

              <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{
                    padding: '4px 12px',
                    background: `${featured.primaryColor}20`,
                    border: `1px solid ${featured.primaryColor}40`,
                    borderRadius: '6px',
                    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '11px',
                    letterSpacing: '0.15em', textTransform: 'uppercase', color: featured.primaryColor,
                  }}>{featured.tag}</div>
                  <div style={{
                    padding: '4px 12px',
                    background: `${DIFFICULTY_COLOR[featured.difficulty]}15`,
                    border: `1px solid ${DIFFICULTY_COLOR[featured.difficulty]}30`,
                    borderRadius: '6px',
                    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '11px',
                    letterSpacing: '0.12em', textTransform: 'uppercase', color: DIFFICULTY_COLOR[featured.difficulty],
                  }}>{featured.difficulty}</div>
                </div>
                <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem,4vw,3.5rem)', lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'white', marginBottom: '8px' }}>
                  {featured.title}
                </h2>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: featured.primaryColor, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {featured.subtitle}
                </div>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 500, fontSize: '15px', color: 'rgba(255,255,255,0.5)', maxWidth: '480px', lineHeight: 1.5 }}>
                  {featured.desc}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <Stat label="PLAYERS" value={featured.players}/>
                    <Stat label="XP REWARD" value={featured.xp} accent={featured.primaryColor}/>
                  </div>
                  <div style={{
                    marginLeft: 'auto',
                    padding: '14px 32px',
                    background: featured.primaryColor,
                    border: 'none',
                    borderRadius: '14px',
                    color: '#05080f',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 900, fontSize: '18px',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    boxShadow: `0 6px 24px ${featured.primaryColor}40`,
                  }}>
                    LAUNCH MODE →
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* ALL OTHER MODES — 2-column grid */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: '#f97316' }}/>
          <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>ALL MODES</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(249,115,22,0.15)' }}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {others.map((mode) => (
            <ModeCard key={mode.id} mode={mode}/>
          ))}
        </div>
      </div>
    </div>
  )
}

function ModeCard({ mode }: { mode: GameMode }) {
  const diffColor = DIFFICULTY_COLOR[mode.difficulty]
  return (
    <Link href={mode.href} style={{ textDecoration: 'none' }}>
      <div style={{
        position: 'relative',
        padding: '24px',
        background: `rgba(255,255,255,0.03)`,
        border: `1px solid ${mode.primaryColor}20`,
        borderRadius: '18px',
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Top accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${mode.primaryColor}, ${mode.secondaryColor})` }}/>

        {/* BG glow */}
        <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '150px', height: '150px', borderRadius: '50%', background: `radial-gradient(ellipse, ${mode.primaryColor}0a 0%, transparent 70%)`, pointerEvents: 'none' }}/>

        {/* SVG preview */}
        <div style={{ position: 'absolute', bottom: '12px', right: '12px', opacity: 0.4 }}>
          <FieldSVG color={mode.primaryColor}/>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Tags row */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <div style={{
              padding: '3px 10px',
              background: `${diffColor}15`,
              border: `1px solid ${diffColor}30`,
              borderRadius: '6px',
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '10px',
              letterSpacing: '0.12em', textTransform: 'uppercase', color: diffColor,
            }}>{mode.difficulty}</div>
            {mode.tag && (
              <div style={{
                padding: '3px 10px',
                background: `${mode.primaryColor}15`,
                border: `1px solid ${mode.primaryColor}30`,
                borderRadius: '6px',
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '10px',
                letterSpacing: '0.12em', textTransform: 'uppercase', color: mode.primaryColor,
              }}>{mode.tag}</div>
            )}
          </div>

          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '26px', lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'white', marginBottom: '6px' }}>
            {mode.title}
          </div>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', letterSpacing: '0.06em', textTransform: 'uppercase', color: mode.primaryColor, marginBottom: '10px' }}>
            {mode.subtitle}
          </div>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 500, fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: '20px', maxWidth: '240px' }}>
            {mode.desc}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Stat label="PLAYERS" value={mode.players} small/>
              <Stat label="XP" value={mode.xp} accent={mode.primaryColor} small/>
            </div>
            <div style={{
              padding: '8px 20px',
              background: `${mode.primaryColor}15`,
              border: `1px solid ${mode.primaryColor}30`,
              borderRadius: '10px',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: '13px',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: mode.primaryColor,
            }}>PLAY</div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function Stat({ label, value, accent, small }: { label: string; value: string; accent?: string; small?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: small ? '10px' : '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', lineHeight: 1 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: small ? '15px' : '20px', color: accent ?? 'white', lineHeight: 1.1 }}>
        {value}
      </div>
    </div>
  )
}
