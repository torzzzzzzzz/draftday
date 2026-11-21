import { createClient } from '@/lib/supabase/server'
import { CareerOfTheWeek } from '@/components/leaderboard/CareerOfTheWeek'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Leaderboards · Draft Day' }

function TrophyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 13c-3.5 0-6-2.5-6-6V3h12v4c0 3.5-2.5 6-6 6z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M4 5H2a1 1 0 000 2c0 1.5 1 2.5 2 3M16 5h2a1 1 0 010 2c0 1.5-1 2.5-2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 13v3M7 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L10 14.4l-4.8 2.5.9-5.4L2.2 7.7l5.4-.8L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

function FireIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2c0 0 5 4 5 9a5 5 0 01-10 0c0-2 1-3.5 2-4.5 0 1.5 1 2.5 2 3 0-3 1-5.5 1-7.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.85rem', color: '#fff',
      flexShrink: 0, boxShadow: '0 0 12px rgba(245,158,11,0.5)',
    }}>1</div>
  )
  if (rank === 2) return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'linear-gradient(135deg, #94a3b8, #64748b)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.85rem', color: '#fff',
      flexShrink: 0,
    }}>2</div>
  )
  if (rank === 3) return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'linear-gradient(135deg, #cd7c3f, #a0522d)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.85rem', color: '#fff',
      flexShrink: 0,
    }}>3</div>
  )
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'var(--navy-700)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--charcoal-200)',
      flexShrink: 0,
    }}>{rank}</div>
  )
}

export default async function LeaderboardsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: hofEntriesRaw } = await supabase
    .from('hall_of_fame')
    .select(`*, profiles(username)`)
    .order('overall_rating', { ascending: false })
    .limit(10)
  const hofEntries = hofEntriesRaw as any[] | null

  // Top OVR careers
  const { data: topCareersRaw } = await supabase
    .from('careers')
    .select(`*, players(name, position, overall)`)
    .eq('status', 'active')
    .order('super_bowl_wins', { ascending: false })
    .limit(10)
  const topCareers = topCareersRaw as any[] | null

  const statCards = [
    { label: 'Hall of Famers', value: hofEntries?.length ?? 0, icon: <StarIcon />, color: 'var(--gold-500)', glow: 'rgba(245,158,11,0.15)' },
    { label: 'Active Careers', value: topCareers?.length ?? 0, icon: <FireIcon />, color: 'var(--orange-500)', glow: 'rgba(249,115,22,0.15)' },
    { label: 'Super Bowls Won', value: topCareers?.reduce((s: number, c: any) => s + (c.super_bowl_wins || 0), 0) ?? 0, icon: <TrophyIcon />, color: 'var(--green-500)', glow: 'rgba(34,197,94,0.15)' },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--orange-400)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          SEASON 1
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2.5rem,6vw,4rem)', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          LEADERBOARDS
        </h1>
        <p style={{ color: 'var(--charcoal-300)', marginTop: '0.5rem' }}>
          The best careers in Draft Day history
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map((stat, i) => (
          <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '0.75rem',
              background: stat.glow,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: stat.color, flexShrink: 0,
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', color: '#fff', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--charcoal-400)', marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Career of the Week */}
        <div>
          <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--orange-400)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Career of the Week
          </div>
          <CareerOfTheWeek />
        </div>

        {/* Hall of Fame */}
        <div>
          <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold-500)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Hall of Fame
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ color: 'var(--gold-500)' }}><StarIcon /></div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                  Hall of Fame
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--charcoal-400)' }}>
                  Legendary careers — 3+ Super Bowls
                </div>
              </div>
            </div>

            {hofEntries && hofEntries.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {hofEntries.map((entry: any, i: number) => (
                  <div key={entry.id} className="lb-row" style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', borderRadius: '0.5rem',
                    background: i === 0 ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
                    border: i === 0 ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
                  }}>
                    <RankBadge rank={i + 1} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                        {entry.player_name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--charcoal-400)', marginTop: 2 }}>
                        {entry.position} · @{(entry.profiles as any)?.username}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.25rem', color: 'var(--gold-500)' }}>
                        {entry.overall_rating}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--gold-400)', marginTop: 1 }}>
                        SB ×{entry.super_bowl_wins}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 1rem' }}>
                  <circle cx="24" cy="24" r="22" stroke="var(--navy-600)" strokeWidth="2"/>
                  <path d="M24 10l3 7h7l-5.5 4 2 7L24 24l-6.5 4 2-7L14 17h7l3-7z" stroke="var(--charcoal-500)" strokeWidth="1.5" fill="none"/>
                </svg>
                <p style={{ color: 'var(--charcoal-500)', fontSize: '0.9rem' }}>No Hall of Famers yet</p>
                <p style={{ color: 'var(--charcoal-600)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Win 3+ Super Bowls to be inducted
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Active Careers */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--orange-400)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Top Active Careers
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '48px 1fr 80px 80px 80px',
            padding: '0 0.5rem 0.75rem', borderBottom: '1px solid var(--border)',
            fontSize: '0.65rem', fontFamily: 'var(--font-display)', fontWeight: 700,
            letterSpacing: '0.1em', color: 'var(--charcoal-500)', textTransform: 'uppercase',
          }}>
            <span>#</span>
            <span>Player / Position</span>
            <span style={{ textAlign: 'center' }}>OVR</span>
            <span style={{ textAlign: 'center' }}>SBs</span>
            <span style={{ textAlign: 'center' }}>Season</span>
          </div>
          {topCareers && topCareers.length > 0 ? (
            topCareers.map((career: any, i: number) => {
              const player = career.players as any
              return (
                <div key={career.id} style={{
                  display: 'grid', gridTemplateColumns: '48px 1fr 80px 80px 80px',
                  padding: '0.75rem 0.5rem', alignItems: 'center',
                  borderBottom: i < topCareers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <RankBadge rank={i + 1} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                      {player?.name ?? 'Unknown'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--charcoal-400)', marginTop: 1 }}>
                      {player?.position}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--orange-400)' }}>
                    {player?.overall ?? '--'}
                  </div>
                  <div style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--gold-400)' }}>
                    {career.super_bowl_wins ?? 0}
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--charcoal-300)' }}>
                    {career.season ?? 1}
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--charcoal-500)' }}>
              No active careers yet. Be the first!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
