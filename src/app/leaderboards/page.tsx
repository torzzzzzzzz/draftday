import { createClient } from '@/lib/supabase/server'
import { CareerOfTheWeek } from '@/components/leaderboard/CareerOfTheWeek'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Leaderboards · Draft Day' }

export default async function LeaderboardsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: hofEntriesRaw } = await supabase
    .from('hall_of_fame')
    .select(`*, profiles(username)`)
    .order('overall_rating', { ascending: false })
    .limit(10)
  const hofEntries = hofEntriesRaw as any[] | null

  const { data: topCareersRaw } = await supabase
    .from('careers')
    .select(`*, players(name, position, overall)`)
    .eq('status', 'active')
    .order('super_bowl_wins', { ascending: false })
    .limit(10)
  const topCareers = topCareersRaw as any[] | null

  const totalSBs = topCareers?.reduce((s: number, c: any) => s + (c.super_bowl_wins || 0), 0) ?? 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-950)' }}>

      {/* SCOREBOARD HERO */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #0a1628 0%, #05080f 100%)',
        borderBottom: '1px solid rgba(249,115,22,0.2)',
        overflow: 'hidden',
        padding: '3rem 2rem 2.5rem',
      }}>
        {/* Background grid lines */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}/>
        {/* Orange glow */}
        <div style={{
          position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(249,115,22,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Season badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', marginBottom: '20px',
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: '99px',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316', animation: 'pulse 2s infinite' }}/>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', letterSpacing: '0.15em', color: '#f97316', textTransform: 'uppercase' }}>
              SEASON 1 · LIVE
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(3rem, 7vw, 5.5rem)',
            lineHeight: 0.9,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: 'white',
            marginBottom: '24px',
          }}>
            DRAFT DAY<br/><span style={{ color: '#f97316' }}>RANKINGS</span>
          </h1>

          {/* Stat ticker */}
          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            {[
              { label: 'Hall of Famers', value: hofEntries?.length ?? 0, color: '#f59e0b' },
              { label: 'Active Careers', value: topCareers?.length ?? 0, color: '#f97316' },
              { label: 'Super Bowls Won', value: totalSBs, color: '#22c55e' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '40px', color, lineHeight: 1 }}>
                  {value}
                </span>
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem 4rem' }}>

        {/* TOP BOARD — full width rankings table */}
        <div style={{ marginBottom: '2.5rem' }}>
          <SectionHeader label="TOP ACTIVE CAREERS" color="#f97316"/>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            {/* Table head */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 100px 100px 100px 80px',
              padding: '12px 20px',
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700,
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
            }}>
              <span>RANK</span>
              <span>PLAYER</span>
              <span style={{ textAlign: 'center' }}>OVR</span>
              <span style={{ textAlign: 'center' }}>SUPER BOWLS</span>
              <span style={{ textAlign: 'center' }}>SEASON</span>
              <span style={{ textAlign: 'right' }}>STAGE</span>
            </div>

            {topCareers && topCareers.length > 0 ? topCareers.map((career: any, i: number) => {
              const player = career.players as any
              const isTop3 = i < 3
              const rankColors = ['#f59e0b', '#94a3b8', '#cd7c3f']
              const rankColor = isTop3 ? rankColors[i] : 'rgba(255,255,255,0.3)'
              return (
                <div key={career.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 100px 100px 100px 80px',
                  padding: '14px 20px',
                  alignItems: 'center',
                  borderBottom: i < topCareers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  background: i === 0 ? 'rgba(245,158,11,0.04)' : 'transparent',
                  transition: 'background 0.15s',
                }}>
                  {/* Rank */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: isTop3 ? `${rankColor}18` : 'transparent',
                    border: isTop3 ? `1.5px solid ${rankColor}44` : '1.5px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 900,
                    fontSize: isTop3 ? '18px' : '14px',
                    color: rankColor,
                  }}>
                    {i + 1}
                  </div>

                  {/* Player */}
                  <div>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '17px', color: 'white', lineHeight: 1.1 }}>
                      {player?.name ?? 'Unknown Player'}
                    </div>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', marginTop: '2px' }}>
                      {player?.position} · {career.nfl_team || 'Free Agent'}
                    </div>
                  </div>

                  {/* OVR */}
                  <div style={{
                    textAlign: 'center',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 900,
                    fontSize: '24px',
                    color: (player?.overall ?? 70) >= 90 ? '#22c55e' : (player?.overall ?? 70) >= 80 ? '#3b82f6' : '#f97316',
                  }}>
                    {player?.overall ?? '--'}
                  </div>

                  {/* Super Bowls */}
                  <div style={{ textAlign: 'center' }}>
                    {career.super_bowl_wins > 0 ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        background: 'rgba(245,158,11,0.15)',
                        border: '1px solid rgba(245,158,11,0.3)',
                        borderRadius: '8px',
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontWeight: 800,
                        fontSize: '14px',
                        color: '#f59e0b',
                      }}>
                        🏆 {career.super_bowl_wins}
                      </span>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '14px' }}>—</span>
                    )}
                  </div>

                  {/* Season */}
                  <div style={{ textAlign: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: 'rgba(255,255,255,0.6)' }}>
                    {career.season ?? 1}
                  </div>

                  {/* Stage */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontWeight: 700,
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      background: career.stage === 'nfl' ? 'rgba(34,197,94,0.15)' : career.stage === 'college' ? 'rgba(59,130,246,0.15)' : 'rgba(249,115,22,0.15)',
                      color: career.stage === 'nfl' ? '#22c55e' : career.stage === 'college' ? '#60a5fa' : '#f97316',
                      border: `1px solid ${career.stage === 'nfl' ? 'rgba(34,197,94,0.3)' : career.stage === 'college' ? 'rgba(59,130,246,0.3)' : 'rgba(249,115,22,0.3)'}`,
                    }}>
                      {career.stage?.toUpperCase() ?? 'HS'}
                    </span>
                  </div>
                </div>
              )
            }) : (
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ margin: '0 auto 16px' }}>
                  <circle cx="32" cy="32" r="30" stroke="rgba(255,255,255,0.08)" strokeWidth="2"/>
                  <path d="M32 14l3.5 10 10.5 1-7.5 7.5 2.5 10.5L32 38l-9 5.5 2.5-10.5L18.5 25l10.5-1L32 14z" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none"/>
                </svg>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '18px', color: 'rgba(255,255,255,0.3)' }}>
                  No careers ranked yet. Be first on the board.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM: Career of Week + Hall of Fame side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Career of the Week */}
          <div>
            <SectionHeader label="CAREER OF THE WEEK" color="#f97316"/>
            <CareerOfTheWeek />
          </div>

          {/* Hall of Fame */}
          <div>
            <SectionHeader label="HALL OF FAME" color="#f59e0b"/>
            <div style={{
              background: 'rgba(245,158,11,0.03)',
              border: '1px solid rgba(245,158,11,0.15)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}>
              {/* HOF header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(245,158,11,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L10 14.4l-4.8 2.5.9-5.4L2.2 7.7l5.4-.8L10 2z" fill="rgba(245,158,11,0.3)" stroke="#f59e0b" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
                <div>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '15px', color: 'white' }}>
                    Hall of Fame
                  </div>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
                    3+ SUPER BOWLS · ALL-TIME GREATS
                  </div>
                </div>
              </div>

              {hofEntries && hofEntries.length > 0 ? (
                <div>
                  {hofEntries.map((entry: any, i: number) => (
                    <div key={entry.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 20px',
                      borderBottom: i < hofEntries.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      background: i === 0 ? 'rgba(245,158,11,0.06)' : 'transparent',
                    }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                        background: i === 0 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                        border: i === 0 ? '1.5px solid rgba(245,158,11,0.4)' : '1.5px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '14px',
                        color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c3f' : 'rgba(255,255,255,0.3)',
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '15px', color: 'white', lineHeight: 1 }}>
                          {entry.player_name}
                        </div>
                        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                          {entry.position} · @{(entry.profiles as any)?.username ?? '—'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '20px', color: '#f59e0b', lineHeight: 1 }}>
                          {entry.overall_rating}
                        </div>
                        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '10px', color: 'rgba(245,158,11,0.6)', letterSpacing: '0.06em', marginTop: '2px' }}>
                          🏆 ×{entry.super_bowl_wins}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 12px' }}>
                    <circle cx="24" cy="24" r="22" stroke="rgba(245,158,11,0.2)" strokeWidth="1.5"/>
                    <path d="M24 10l3 7h7l-5.5 4 2 7L24 24l-6.5 4 2-7L14 17h7l3-7z" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" fill="none"/>
                  </svg>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '15px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>
                    No inductees yet
                  </p>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
                    Win 3+ Super Bowls to earn immortality
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

function SectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px',
    }}>
      <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: color, flexShrink: 0 }}/>
      <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }}/>
    </div>
  )
}
