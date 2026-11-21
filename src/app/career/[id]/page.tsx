import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Career Details · Draft Day' }

const STAGE_ORDER = ['high_school', 'college', 'nfl', 'retired']
const STAGE_LABEL: Record<string, string> = {
  high_school: 'High School',
  college: 'College',
  nfl: 'NFL',
  retired: 'Retired',
}

function StatBar({ value, max = 99, color = 'var(--green-500)' }: { value: number; max?: number; color?: string }) {
  return (
    <div style={{ height: 4, background: 'var(--navy-700)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${(value / max) * 100}%`,
        background: color, borderRadius: 999,
        transition: 'width 0.5s ease',
      }} />
    </div>
  )
}

function AwardBadge({ label, color, count }: { label: string; color: string; count: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.625rem 0.875rem',
      background: `${color}10`, border: `1px solid ${color}30`,
      borderRadius: '0.5rem',
    }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--charcoal-200)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color }}>
        ×{count}
      </span>
    </div>
  )
}

function LargePlayerArtSVG({ position, overall, color }: { position: string; overall: number; color: string }) {
  const ovrColor = overall >= 90 ? '#22c55e' : overall >= 80 ? '#3b82f6' : overall >= 70 ? '#f59e0b' : '#f97316'

  // Position-specific jersey number
  const num = position === 'QB' ? '1' : position === 'WR' ? '11' : position === 'RB' ? '21' :
               position === 'TE' ? '84' : position === 'OL' ? '72' : position === 'DE' ? '99' :
               position === 'DT' ? '91' : position === 'LB' ? '55' : position === 'CB' ? '24' :
               position === 'S' ? '32' : '50'

  return (
    <svg width="160" height="220" viewBox="0 0 160 220" fill="none">
      {/* Glow */}
      <ellipse cx="80" cy="200" rx="60" ry="12" fill={color} opacity="0.15"/>
      {/* Body/jersey */}
      <path d="M40 100 L30 60 L50 50 L60 70 L80 65 L100 70 L110 50 L130 60 L120 100 L115 160 L45 160 Z"
        fill={color} opacity="0.9"/>
      {/* Jersey stripe */}
      <path d="M42 100 L45 160 L115 160 L118 100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none"/>
      {/* Helmet */}
      <ellipse cx="80" cy="45" rx="28" ry="26" fill={color}/>
      <ellipse cx="80" cy="45" rx="28" ry="26" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none"/>
      {/* Facemask */}
      <path d="M54 45 L54 60 M58 48 L58 65 M62 50 L62 67"
        stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Visor */}
      <path d="M54 42 Q80 52 106 42" fill="rgba(0,0,0,0.3)" stroke="none"/>
      {/* Shoulder pads */}
      <path d="M28 75 Q40 65 60 68 L58 90 Q40 88 25 85 Z" fill={color} opacity="0.8"/>
      <path d="M132 75 Q120 65 100 68 L102 90 Q120 88 135 85 Z" fill={color} opacity="0.8"/>
      {/* Arms */}
      <path d="M25 85 L18 130 L35 130 L40 90" fill={color} opacity="0.7"/>
      <path d="M135 85 L142 130 L125 130 L120 90" fill={color} opacity="0.7"/>
      {/* Gloves */}
      <ellipse cx="26" cy="135" rx="10" ry="8" fill={color} opacity="0.8"/>
      <ellipse cx="134" cy="135" rx="10" ry="8" fill={color} opacity="0.8"/>
      {/* Pants */}
      <path d="M45 160 L40 200 L60 200 L80 175 L100 200 L120 200 L115 160 Z"
        fill="var(--navy-700)"/>
      {/* Number */}
      <text x="80" y="135" textAnchor="middle" fill="rgba(255,255,255,0.9)"
        fontSize="28" fontWeight="900" fontFamily="var(--font-display)">{num}</text>
      {/* OVR badge */}
      <rect x="2" y="2" width="36" height="36" rx="6" fill="var(--navy-900)" stroke={ovrColor} strokeWidth="1.5"/>
      <text x="20" y="17" textAnchor="middle" fill={ovrColor} fontSize="13" fontWeight="900"
        fontFamily="var(--font-display)">{overall}</text>
      <text x="20" y="29" textAnchor="middle" fill={ovrColor} fontSize="8" fontWeight="700"
        fontFamily="var(--font-display)" opacity="0.7">OVR</text>
      {/* POS badge */}
      <rect x="122" y="2" width="36" height="20" rx="4" fill="rgba(255,255,255,0.08)"/>
      <text x="140" y="15" textAnchor="middle" fill="var(--charcoal-200)" fontSize="9" fontWeight="700"
        fontFamily="var(--font-display)">{position}</text>
    </svg>
  )
}

export default async function CareerDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: careerRaw } = await supabase
    .from('careers')
    .select(`*, players(*)`)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!careerRaw) notFound()
  const career = careerRaw as any

  const { data: recentGamesRaw } = await supabase
    .from('game_results')
    .select('*')
    .eq('career_id', (career as any).id)
    .order('created_at', { ascending: false })
    .limit(5)
  const recentGames = recentGamesRaw as any[] | null

  const player = career.players as any
  const stageIndex = STAGE_ORDER.indexOf(career.stage)
  const playerColor = player.primary_color || 'var(--orange-500)'

  const totalGames = (career.season_wins ?? 0) + (career.season_losses ?? 0)
  const winPct = totalGames > 0 ? Math.round((career.season_wins / totalGames) * 100) : 0

  // Build attribute display
  const attrs: Array<{ label: string; value: number; category: string }> = []
  if (player.speed)         attrs.push({ label: 'Speed',         value: player.speed,         category: 'Physical' })
  if (player.strength)      attrs.push({ label: 'Strength',      value: player.strength,      category: 'Physical' })
  if (player.agility)       attrs.push({ label: 'Agility',       value: player.agility,       category: 'Physical' })
  if (player.awareness)     attrs.push({ label: 'Awareness',     value: player.awareness,     category: 'Mental' })
  if (player.throw_power)   attrs.push({ label: 'Throw Power',   value: player.throw_power,   category: 'Skill' })
  if (player.throw_accuracy) attrs.push({ label: 'Accuracy',    value: player.throw_accuracy, category: 'Skill' })
  if (player.catching)      attrs.push({ label: 'Catching',      value: player.catching,      category: 'Skill' })
  if (player.route_running) attrs.push({ label: 'Route Running', value: player.route_running, category: 'Skill' })

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link href="/career" className="btn btn-ghost" style={{ padding: '0.5rem 0.875rem', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: 4 }}>
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Back
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--orange-400)', textTransform: 'uppercase' }}>
            {STAGE_LABEL[career.stage]} · Year {career.current_year ?? 1}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.75rem,5vw,2.5rem)', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {player.name}
          </h1>
        </div>
        <Link href={`/play/simple?career=${career.id}`} className="btn btn-primary" style={{ flexShrink: 0 }}>
          Play Next Game →
        </Link>
      </div>

      {/* Stage progress */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {STAGE_ORDER.map((stage, i) => (
            <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: i < stageIndex ? 'var(--orange-500)' : i === stageIndex ? 'rgba(249,115,22,0.15)' : 'var(--navy-700)',
                  border: i <= stageIndex ? '2px solid var(--orange-500)' : '2px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {i < stageIndex ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l4 4 6-7" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.65rem', color: i === stageIndex ? 'var(--orange-400)' : 'var(--charcoal-500)' }}>
                      {i + 1}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: i === stageIndex ? 'var(--orange-400)' : 'var(--charcoal-500)', textAlign: 'center' }}>
                  {STAGE_LABEL[stage]}
                </span>
              </div>
              {i < STAGE_ORDER.length - 1 && (
                <div style={{ height: 2, flex: 2, background: i < stageIndex ? 'var(--orange-500)' : 'var(--border)', marginBottom: '1.25rem' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem' }}>
        {/* Left: Player card */}
        <div>
          {/* Large player art */}
          <div className="card" style={{
            padding: '1.5rem',
            background: `linear-gradient(160deg, var(--navy-800) 0%, ${playerColor}18 100%)`,
            border: `1px solid ${playerColor}30`,
            textAlign: 'center',
            marginBottom: '1rem',
          }}>
            <LargePlayerArtSVG
              position={player.position}
              overall={player.overall}
              color={playerColor}
            />
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.25rem', color: '#fff', lineHeight: 1 }}>
                {player.name}
              </div>
              {player.nickname && (
                <div style={{ fontSize: '0.8rem', color: 'var(--charcoal-400)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                  &ldquo;{player.nickname}&rdquo;
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{
                  background: `${playerColor}20`, border: `1px solid ${playerColor}40`,
                  padding: '0.2rem 0.6rem', borderRadius: '0.375rem',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', color: playerColor,
                }}>{player.position}</span>
                {career.nfl_team && (
                  <span style={{
                    background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                    padding: '0.2rem 0.6rem', borderRadius: '0.375rem',
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--gold-400)',
                  }}>{career.nfl_team}</span>
                )}
              </div>
            </div>
          </div>

          {/* Accolades */}
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--charcoal-400)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Accolades
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {career.super_bowl_wins > 0 && <AwardBadge label="Super Bowl" color="var(--gold-500)" count={career.super_bowl_wins} />}
              {career.mvp_awards > 0 && <AwardBadge label="MVP Award" color="#60a5fa" count={career.mvp_awards} />}
              {career.pro_bowl_selections > 0 && <AwardBadge label="Pro Bowl" color="#c084fc" count={career.pro_bowl_selections} />}
              {career.all_pro_selections > 0 && <AwardBadge label="All-Pro" color="var(--orange-400)" count={career.all_pro_selections} />}
              {career.hall_of_fame && (
                <div style={{
                  padding: '0.625rem 0.875rem',
                  background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)',
                  borderRadius: '0.5rem',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', color: '#c084fc',
                }}>
                  Hall of Fame
                </div>
              )}
              {!career.super_bowl_wins && !career.mvp_awards && !career.pro_bowl_selections && !career.hall_of_fame && (
                <p style={{ fontSize: '0.75rem', color: 'var(--charcoal-500)', textAlign: 'center', padding: '0.5rem 0' }}>
                  No accolades yet — keep winning
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: stats & games */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Season stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {[
              { label: 'Year', value: career.current_year ?? 1, color: '#fff' },
              { label: 'W-L', value: `${career.season_wins ?? 0}-${career.season_losses ?? 0}`, color: 'var(--green-400)' },
              { label: 'Win %', value: `${winPct}%`, color: 'var(--orange-400)' },
              { label: 'Rep', value: `${career.reputation_score ?? 0}`, color: 'var(--gold-400)' },
            ].map((stat) => (
              <div key={stat.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.5rem', color: stat.color, lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--charcoal-500)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Attributes */}
          {attrs.length > 0 && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--charcoal-400)', textTransform: 'uppercase', marginBottom: '0.875rem' }}>
                Attributes
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                {attrs.map((attr) => {
                  const barColor = attr.value >= 90 ? '#22c55e' : attr.value >= 80 ? '#3b82f6' : attr.value >= 70 ? '#f59e0b' : '#f97316'
                  return (
                    <div key={attr.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--charcoal-200)' }}>{attr.label}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', color: barColor }}>
                          {attr.value}
                        </span>
                      </div>
                      <StatBar value={attr.value} color={barColor} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent games */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--charcoal-400)', textTransform: 'uppercase' }}>
                Recent Games
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--charcoal-500)' }}>Last 5</span>
            </div>
            {recentGames && recentGames.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentGames.map((game: any) => (
                  <div key={game.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    padding: '0.75rem 1rem', borderRadius: '0.625rem',
                    background: game.won ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
                    border: `1px solid ${game.won ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)'}`,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '0.375rem',
                      background: game.won ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.85rem',
                      color: game.won ? '#22c55e' : '#f87171', flexShrink: 0,
                    }}>
                      {game.won ? 'W' : 'L'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                        {game.score_for} – {game.score_against}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--charcoal-400)', marginTop: 1 }}>
                        {new Date(game.played_at || game.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {game.won && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--orange-400)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                        +XP
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ color: 'var(--charcoal-500)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  No games played yet
                </div>
                <Link href={`/play/simple?career=${career.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                  Start Playing
                </Link>
              </div>
            )}
          </div>

          {/* Reputation */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--charcoal-400)', textTransform: 'uppercase' }}>
                Reputation
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', color: '#fff' }}>
                {career.reputation_score ?? 0}/100
              </span>
            </div>
            <div style={{ height: 8, background: 'var(--navy-700)', borderRadius: 999, overflow: 'hidden', marginBottom: '0.5rem' }}>
              <div style={{
                height: '100%',
                width: `${career.reputation_score ?? 0}%`,
                background: (career.reputation_score ?? 0) >= 75
                  ? 'linear-gradient(90deg, #22c55e, #34d399)'
                  : (career.reputation_score ?? 0) >= 50
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                  : 'linear-gradient(90deg, #f97316, #fb923c)',
                borderRadius: 999,
                transition: 'width 0.5s ease',
              }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--charcoal-400)' }}>
              {(career.reputation_score ?? 0) >= 75 ? 'Elite reputation — scouts are watching'
               : (career.reputation_score ?? 0) >= 50 ? 'Growing reputation — keep building'
               : 'Building your name — keep winning'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
