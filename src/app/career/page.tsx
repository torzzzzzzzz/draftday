import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Career · Draft Day' }

const STAGE_INFO: Record<string, { label: string; color: string; next: string; badge: string }> = {
  high_school: { label: 'High School', color: 'var(--orange-400)', next: 'Get recruited to college', badge: 'HS' },
  college:     { label: 'College',     color: 'var(--navy-200)',   next: 'Enter the NFL Draft',      badge: 'NCAA' },
  nfl:         { label: 'NFL',         color: 'var(--gold-400)',   next: 'Win Super Bowls',           badge: 'NFL' },
  retired:     { label: 'Retired',     color: 'var(--charcoal-300)', next: 'Legacy complete',         badge: 'RET' },
}

function PlayerCardSVG({ position, overall, color }: { position: string; overall: number; color: string }) {
  const ovrColor = overall >= 90 ? '#22c55e' : overall >= 80 ? '#3b82f6' : overall >= 70 ? '#f59e0b' : '#f97316'
  return (
    <svg width="64" height="90" viewBox="0 0 64 90" fill="none">
      <rect width="64" height="90" rx="8" fill="var(--navy-800)"/>
      <rect width="64" height="90" rx="8" stroke={color} strokeWidth="1.5" fill="none"/>
      {/* Jersey silhouette */}
      <path d="M20 35v-8c0-3 3-5 6-5h12c3 0 6 2 6 5v8" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4"/>
      <path d="M14 35h8v18H14zM42 35h8v18H42zM22 35h20v24H22z" fill={color} opacity="0.08"/>
      {/* Number */}
      <text x="32" y="55" textAnchor="middle" fill={color} fontSize="18" fontWeight="900" fontFamily="var(--font-display)" opacity="0.6">
        {position === 'QB' ? '1' : position === 'WR' ? '11' : position === 'RB' ? '21' : '55'}
      </text>
      {/* OVR */}
      <rect x="2" y="2" width="20" height="20" rx="4" fill={`${ovrColor}20`}/>
      <text x="12" y="16" textAnchor="middle" fill={ovrColor} fontSize="11" fontWeight="900" fontFamily="var(--font-display)">{overall}</text>
      {/* POS */}
      <rect x="42" y="2" width="20" height="20" rx="4" fill="rgba(255,255,255,0.05)"/>
      <text x="52" y="16" textAnchor="middle" fill="var(--charcoal-200)" fontSize="9" fontWeight="700" fontFamily="var(--font-display)">{position}</text>
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function TrophyBadge({ count }: { count: number }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
      borderRadius: '0.375rem', padding: '0.2rem 0.5rem',
      fontSize: '0.7rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gold-400)',
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M5 1l1.2 2.5 2.7.4L7 5.7l.5 2.7L5 7.2 2.5 8.4l.5-2.7L1 3.9l2.7-.4L5 1z" fill="currentColor"/>
      </svg>
      ×{count}
    </span>
  )
}

export default async function CareerPage({ searchParams }: { searchParams: { new?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: careersRaw } = await supabase
    .from('careers')
    .select(`*, players(*)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  const careers = careersRaw as any[] | null

  if (!careers || careers.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          {/* Football SVG */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ margin: '0 auto 1.5rem' }}>
            <ellipse cx="40" cy="40" rx="28" ry="18" stroke="var(--orange-500)" strokeWidth="2.5" fill="rgba(249,115,22,0.1)"/>
            <path d="M12 40h56M40 22v36M24 28l32 24M56 28L24 52" stroke="var(--orange-500)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
          </svg>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2rem', color: '#fff', marginBottom: '0.75rem' }}>
            No Career Yet
          </h1>
          <p style={{ color: 'var(--charcoal-300)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Create your first player to start your football journey — from high school to the NFL.
          </p>
          <Link href="/create-player" className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
            Create Your Player
          </Link>
        </div>
      </div>
    )
  }

  const activeCareers = careers.filter((c: any) => c.is_active)
  const retiredCareers = careers.filter((c: any) => !c.is_active)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--orange-400)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            YOUR JOURNEY
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2.5rem,6vw,4rem)', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
            MY CAREER
          </h1>
          <p style={{ color: 'var(--charcoal-300)', marginTop: '0.5rem' }}>
            From high school to the Hall of Fame
          </p>
        </div>
        <Link href="/create-player" className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>
          + New Player
        </Link>
      </div>

      {/* Welcome banner */}
      {searchParams.new === 'true' && (
        <div style={{
          marginBottom: '1.5rem', padding: '1rem 1.25rem',
          background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)',
          borderRadius: '0.75rem',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--orange-300)',
        }}>
          Your career has begun. Play your first game and make history.
        </div>
      )}

      {/* Active careers */}
      {activeCareers.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--orange-400)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Active ({activeCareers.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {activeCareers.map((career: any) => {
              const player = career.players as any
              if (!player) return null
              const stage = STAGE_INFO[career.stage as string] ?? STAGE_INFO.nfl
              const playerColor = player.primary_color || 'var(--orange-500)'

              return (
                <Link key={career.id} href={`/career/${career.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-hover" style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      {/* Player card thumb */}
                      <PlayerCardSVG
                        position={player.position}
                        overall={player.overall}
                        color={playerColor}
                      />

                      {/* Player info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.65rem', fontFamily: 'var(--font-display)', fontWeight: 700,
                            color: stage.color, background: `${stage.color}15`,
                            padding: '0.2rem 0.5rem', borderRadius: '0.25rem', letterSpacing: '0.08em',
                            border: `1px solid ${stage.color}30`,
                          }}>
                            {stage.badge}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--charcoal-400)' }}>
                            {stage.label} · Year {career.current_year ?? 1}
                          </span>
                          {career.nfl_team && (
                            <span style={{
                              fontSize: '0.7rem', color: 'var(--gold-400)',
                              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                              padding: '0.15rem 0.5rem', borderRadius: '0.25rem',
                              fontFamily: 'var(--font-display)', fontWeight: 700,
                            }}>
                              {career.nfl_team}
                            </span>
                          )}
                        </div>

                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.5rem', color: '#fff', lineHeight: 1, marginBottom: '0.5rem' }}>
                          {player.name}
                        </div>

                        {/* Accolades */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {career.super_bowl_wins > 0 && <TrophyBadge count={career.super_bowl_wins} />}
                          {career.mvp_awards > 0 && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                              background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                              borderRadius: '0.375rem', padding: '0.2rem 0.5rem',
                              fontSize: '0.7rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#60a5fa',
                            }}>
                              MVP ×{career.mvp_awards}
                            </span>
                          )}
                          {career.hall_of_fame && (
                            <span style={{
                              background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)',
                              borderRadius: '0.375rem', padding: '0.2rem 0.5rem',
                              fontSize: '0.7rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#c084fc',
                            }}>
                              HOF
                            </span>
                          )}
                        </div>
                      </div>

                      {/* OVR + chevron */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', lineHeight: 1,
                          color: player.overall >= 90 ? '#22c55e' : player.overall >= 80 ? '#3b82f6' : player.overall >= 70 ? '#f59e0b' : '#f97316',
                        }}>
                          {player.overall}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--charcoal-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                          Overall
                        </div>
                        <div style={{ color: 'var(--charcoal-500)', marginTop: '0.5rem' }}>
                          <ChevronRight />
                        </div>
                      </div>
                    </div>

                    {/* Reputation bar */}
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--charcoal-500)' }}>Next: {stage.next}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--charcoal-500)' }}>Rep {career.reputation_score ?? 0}/100</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--navy-700)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${career.reputation_score ?? 0}%`,
                          background: 'linear-gradient(90deg, var(--green-500), #34d399)',
                          borderRadius: 999,
                        }} />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Retired careers */}
      {retiredCareers.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--charcoal-400)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Retired ({retiredCareers.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {retiredCareers.map((career: any) => {
              const player = career.players as any
              if (!player) return null
              return (
                <Link key={career.id} href={`/career/${career.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{
                    padding: '0.875rem 1.25rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    opacity: 0.75, transition: 'opacity 0.2s ease',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '0.5rem',
                      background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M3 9h12M9 3v12M4 4l10 10M14 4L4 14" stroke="#c084fc" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
                        <circle cx="9" cy="9" r="7" stroke="#c084fc" strokeWidth="1.5" fill="none"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{player.name}</span>
                      <span style={{ color: 'var(--charcoal-500)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>· {player.position} · OVR {player.overall}</span>
                    </div>
                    {career.super_bowl_wins > 0 && <TrophyBadge count={career.super_bowl_wins} />}
                    <div style={{ color: 'var(--charcoal-600)' }}><ChevronRight /></div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
