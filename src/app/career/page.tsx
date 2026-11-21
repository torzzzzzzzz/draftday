import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Career · Draft Day' }

const STAGE_INFO: Record<string, { label: string; color: string; next: string; badge: string }> = {
  high_school: { label: 'High School', color: '#f97316', next: 'Get recruited to college', badge: 'HS' },
  college:     { label: 'College',     color: '#3b82f6', next: 'Enter the NFL Draft',       badge: 'NCAA' },
  nfl:         { label: 'NFL',         color: '#f59e0b', next: 'Win Super Bowls',            badge: 'NFL' },
  retired:     { label: 'Retired',     color: '#6b7280', next: 'Legacy complete',            badge: 'RET' },
}

const OVR_COLOR = (ovr: number) =>
  ovr >= 90 ? '#a855f7' : ovr >= 80 ? '#22c55e' : ovr >= 70 ? '#f59e0b' : '#f97316'

function MiniCardSVG({ position, overall, color }: { position: string; overall: number; color: string }) {
  const ovrC = OVR_COLOR(overall)
  return (
    <svg width="64" height="90" viewBox="0 0 64 90" fill="none">
      <rect width="64" height="90" rx="8" fill="#0a111e"/>
      <rect x="0.75" y="0.75" width="62.5" height="88.5" rx="7.25" stroke={color} strokeWidth="1.5"/>
      {/* Jersey body */}
      <path d="M20 58V38l4-8h16l4 8v20" fill={`${color}18`} stroke={`${color}30`} strokeWidth="1"/>
      {/* Number */}
      <text x="32" y="56" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="20" fill={color} opacity="0.5">
        {position === 'QB' ? '1' : position === 'WR' ? '11' : position === 'RB' ? '21' : '55'}
      </text>
      {/* OVR badge */}
      <rect x="2" y="2" width="20" height="18" rx="4" fill={`${ovrC}20`}/>
      <text x="12" y="14.5" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="10" fill={ovrC}>{overall}</text>
      {/* POS badge */}
      <rect x="42" y="2" width="20" height="18" rx="4" fill="rgba(255,255,255,0.05)"/>
      <text x="52" y="14.5" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="700" fontSize="8" fill="rgba(255,255,255,0.4)">{position}</text>
      {/* Bottom name bar */}
      <rect x="0" y="74" width="64" height="16" rx="0" fill={`${color}18`}/>
      <rect x="0" y="74" width="64" height="16" rx="0" fill="transparent"/>
    </svg>
  )
}

export default async function CareerPage({ searchParams }: { searchParams: { new?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: careersRaw } = await supabase
    .from('careers').select('*, players(*)').eq('user_id', user.id).order('created_at', { ascending: false })
  const careers = careersRaw as any[] | null

  if (!careers || careers.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--navy-950)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <svg width="100" height="60" viewBox="0 0 100 60" fill="none" style={{ marginBottom: '24px', opacity: 0.4 }}>
            <ellipse cx="50" cy="30" rx="38" ry="24" stroke="#f97316" strokeWidth="2.5" fill="rgba(249,115,22,0.08)"/>
            <line x1="12" y1="30" x2="88" y2="30" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
            <line x1="50" y1="6" x2="50" y2="54" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
          </svg>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '3rem', color: 'white', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: '12px' }}>
            NO CAREER YET
          </h1>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '15px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: '28px' }}>
            Create your first player to begin your journey — from high school legend to NFL champion.
          </p>
          <Link href="/create-player" style={{ display: 'inline-block', padding: '14px 32px', background: '#f97316', borderRadius: '14px', color: '#05080f', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '16px', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', boxShadow: '0 6px 24px rgba(249,115,22,0.35)' }}>
            CREATE YOUR PLAYER
          </Link>
        </div>
      </div>
    )
  }

  const activeCareers = careers.filter((c: any) => c.is_active)
  const retiredCareers = careers.filter((c: any) => !c.is_active)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-950)' }}>

      {/* HEADER */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #05080f 0%, #0d1020 60%, #0a0d1a 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '2.5rem 2rem 2rem',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'repeating-linear-gradient(90deg, white 0, white 1px, transparent 1px, transparent 60px), repeating-linear-gradient(0deg, white 0, white 1px, transparent 1px, transparent 60px)' }}/>
        <div style={{ position: 'absolute', top: '-80px', right: '5%', width: '350px', height: '250px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#a855f7', marginBottom: '12px' }}>
                YOUR DYNASTY
              </div>
              <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 'clamp(2.5rem,6vw,4.5rem)', lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'white' }}>
                MY CAREER
              </h1>
            </div>
            <Link href="/create-player" style={{ padding: '12px 24px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '12px', color: '#f97316', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '14px', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
              + NEW PLAYER
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 2rem 4rem' }}>

        {/* New player banner */}
        {searchParams.new === 'true' && (
          <div style={{ marginBottom: '20px', padding: '14px 20px', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: '12px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '15px', color: '#f97316' }}>
            🏈 Your career has begun. Play your first game and make history.
          </div>
        )}

        {/* ACTIVE CAREERS */}
        {activeCareers.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <SectionLabel label={`ACTIVE · ${activeCareers.length}`} color="#f97316"/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeCareers.map((career: any) => {
                const player = career.players as any
                if (!player) return null
                const stage = STAGE_INFO[career.stage as string] ?? STAGE_INFO.nfl
                const color = player.primary_color || '#f97316'
                const ovr = player.overall ?? 70
                const ovrC = OVR_COLOR(ovr)
                const repPct = Math.min(100, career.reputation_score ?? 0)

                return (
                  <Link key={career.id} href={`/career/${career.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      position: 'relative',
                      padding: '20px 22px',
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${color}20`,
                      borderRadius: '18px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}>
                      {/* Left color bar */}
                      <div style={{ position: 'absolute', left: 0, top: '15%', bottom: '15%', width: '3px', borderRadius: '0 3px 3px 0', background: color }}/>
                      {/* BG glow */}
                      <div style={{ position: 'absolute', top: '-40px', right: '-20px', width: '200px', height: '200px', borderRadius: '50%', background: `radial-gradient(ellipse, ${color}08 0%, transparent 70%)`, pointerEvents: 'none' }}/>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {/* Mini card */}
                        <div style={{ flexShrink: 0 }}>
                          <MiniCardSVG position={player.position} overall={ovr} color={color}/>
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                          {/* Stage + team badges */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            <div style={{ padding: '3px 10px', background: `${stage.color}15`, border: `1px solid ${stage.color}30`, borderRadius: '6px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '11px', letterSpacing: '0.08em', color: stage.color }}>
                              {stage.badge}
                            </div>
                            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                              {stage.label} · Year {career.current_year ?? 1}
                            </span>
                            {career.nfl_team && (
                              <div style={{ padding: '3px 10px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '6px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '11px', color: '#f59e0b' }}>
                                {career.nfl_team}
                              </div>
                            )}
                          </div>

                          {/* Name */}
                          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 'clamp(1.4rem,2.5vw,2rem)', color: 'white', lineHeight: 1, marginBottom: '8px' }}>
                            {player.name}
                            {player.nickname && <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '14px', color: 'rgba(255,255,255,0.35)', marginLeft: '10px', fontStyle: 'italic' }}>"{player.nickname}"</span>}
                          </div>

                          {/* Awards */}
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                            {career.super_bowl_wins > 0 && <AwardBadge label={`🏆 ×${career.super_bowl_wins}`} color="#f59e0b"/>}
                            {career.mvp_awards > 0 && <AwardBadge label={`MVP ×${career.mvp_awards}`} color="#3b82f6"/>}
                            {career.hall_of_fame && <AwardBadge label="🏛️ HOF" color="#a855f7"/>}
                          </div>

                          {/* Rep bar */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Next: {stage.next}</span>
                              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>REP {career.reputation_score ?? 0}</span>
                            </div>
                            <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${repPct}%`, background: 'linear-gradient(90deg, #22c55e, #34d399)', borderRadius: '3px' }}/>
                            </div>
                          </div>
                        </div>

                        {/* OVR + arrow */}
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '48px', color: ovrC, lineHeight: 1 }}>{ovr}</div>
                          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>OVR</div>
                          <div style={{ marginTop: '8px', color: 'rgba(255,255,255,0.3)' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* RETIRED CAREERS */}
        {retiredCareers.length > 0 && (
          <div>
            <SectionLabel label={`RETIRED · ${retiredCareers.length}`} color="rgba(255,255,255,0.3)"/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {retiredCareers.map((career: any) => {
                const player = career.players as any
                if (!player) return null
                return (
                  <Link key={career.id} href={`/career/${career.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', opacity: 0.65 }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 9h8M9 5v8" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/><circle cx="9" cy="9" r="7" stroke="#c084fc" strokeWidth="1.5"/></svg>
                      </div>
                      <div style={{ flex: 1, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '15px', color: 'rgba(255,255,255,0.6)' }}>
                        {player.name}
                        <span style={{ fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginLeft: '10px' }}>{player.position} · OVR {player.overall}</span>
                      </div>
                      {career.super_bowl_wins > 0 && <AwardBadge label={`🏆 ×${career.super_bowl_wins}`} color="#f59e0b"/>}
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AwardBadge({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ padding: '3px 10px', background: `${color}15`, border: `1px solid ${color}30`, borderRadius: '6px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '11px', letterSpacing: '0.06em', color }}>
      {label}
    </div>
  )
}

function SectionLabel({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <div style={{ width: '4px', height: '18px', borderRadius: '2px', background: color }}/>
      <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: `${color}20` }}/>
    </div>
  )
}
