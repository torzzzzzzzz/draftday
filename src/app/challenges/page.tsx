import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Challenges · Draft Day' }

const DEFAULT_CHALLENGES = [
  { id: 'dc1', title: 'Complete 3 Games', description: 'Play and finish 3 games in any career mode', xp_reward: 250, type: 'daily', progress: 0, target: 3, completed: false, icon: '🎮' },
  { id: 'dc2', title: 'Throw for 200 Yards', description: 'Complete a game with 200+ passing yards as a QB', xp_reward: 300, type: 'daily', progress: 1, target: 1, completed: false, icon: '🏈' },
  { id: 'dc3', title: 'Make 2 Field Goals', description: 'Successfully kick 2 field goals in one game', xp_reward: 250, type: 'daily', progress: 0, target: 2, completed: false, icon: '🎯' },
  { id: 'wc1', title: 'Reach Season 3', description: 'Progress your career through 3 full seasons', xp_reward: 500, type: 'weekly', progress: 1, target: 1, completed: false, icon: '📅' },
  { id: 'wc2', title: 'Score 10 Touchdowns', description: 'Accumulate 10 touchdowns across any games this week', xp_reward: 750, type: 'weekly', progress: 4, target: 10, completed: false, icon: '⚡' },
  { id: 'wc3', title: 'Win 5 Games', description: 'Come out on top in 5 different matchups this week', xp_reward: 600, type: 'weekly', progress: 2, target: 5, completed: false, icon: '🏆' },
  { id: 'sc1', title: 'Draft a Legend', description: 'Create a player with 90+ overall rating', xp_reward: 1000, type: 'season', progress: 0, target: 1, completed: false, icon: '👑' },
  { id: 'sc2', title: 'Reach the NFL', description: 'Advance a career from College to the NFL', xp_reward: 1500, type: 'season', progress: 0, target: 1, completed: false, icon: '🌟' },
  { id: 'sc3', title: 'Win the Super Bowl', description: 'Bring your team to the championship and win it all', xp_reward: 2500, type: 'season', progress: 0, target: 1, completed: false, icon: '🏅' },
]

const TYPE_META = {
  daily: { label: 'DAILY MISSIONS', color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)', timer: 'Resets in 3h 24m' },
  weekly: { label: 'WEEKLY OBJECTIVES', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', timer: '4 days 12h remaining' },
  season: { label: 'SEASON GOALS', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', timer: 'Season 1 Active' },
}

export default async function ChallengesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let challenges: any[] = []
  if (user) {
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    challenges = data || []
  }

  const allChallenges = challenges.length > 0 ? challenges : DEFAULT_CHALLENGES
  const completed = allChallenges.filter(c => c.completed).length
  const total = allChallenges.length
  const totalReward = allChallenges.filter(c => !c.completed).reduce((s: number, c: any) => s + (c.xp_reward || 0), 0)

  const daily = allChallenges.filter(c => c.type === 'daily' || (!c.type)).slice(0, 3)
  const weekly = allChallenges.filter(c => c.type === 'weekly').slice(0, 3)
  const season = allChallenges.filter(c => c.type === 'season').slice(0, 3)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-950)' }}>

      {/* MISSION BRIEFING HEADER */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0a1628 0%, #07111e 60%, #050810 100%)',
        borderBottom: '1px solid rgba(249,115,22,0.15)',
        overflow: 'hidden',
        padding: '3rem 2rem 2rem',
      }}>
        {/* Animated scan lines */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 1px, transparent 4px)',
        }}/>
        {/* Target reticle art */}
        <svg style={{ position: 'absolute', right: '5%', top: '10%', opacity: 0.06 }} width="300" height="300" viewBox="0 0 300 300" fill="none">
          <circle cx="150" cy="150" r="140" stroke="white" strokeWidth="1"/>
          <circle cx="150" cy="150" r="100" stroke="white" strokeWidth="1"/>
          <circle cx="150" cy="150" r="60" stroke="white" strokeWidth="1"/>
          <circle cx="150" cy="150" r="20" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
          <line x1="0" y1="150" x2="300" y2="150" stroke="white" strokeWidth="1"/>
          <line x1="150" y1="0" x2="150" y2="300" stroke="white" strokeWidth="1"/>
        </svg>

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '5px 14px', marginBottom: '16px',
                background: 'rgba(249,115,22,0.1)',
                border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: '6px',
              }}>
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.15em', color: '#f97316', textTransform: 'uppercase' }}>
                  MISSION BRIEFING
                </span>
              </div>

              <h1 style={{
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900,
                fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 0.9,
                textTransform: 'uppercase', letterSpacing: '0.02em', color: 'white',
                marginBottom: '10px',
              }}>
                CHALLENGES
              </h1>
              <p style={{
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600,
                fontSize: '16px', color: 'rgba(255,255,255,0.4)',
              }}>
                Complete objectives to earn rewards and climb the rankings
              </p>
            </div>

            {/* Mission status readout */}
            <div style={{
              display: 'flex', gap: '1px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '12px', overflow: 'hidden',
            }}>
              {[
                { label: 'Completed', value: `${completed}/${total}`, color: '#22c55e' },
                { label: 'Available Rewards', value: `${totalReward.toLocaleString()} XP`, color: '#f59e0b' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '28px', color, lineHeight: 1 }}>
                    {value}
                  </div>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall progress bar */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                MISSION PROGRESS
              </span>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                {total > 0 ? Math.round((completed / total) * 100) : 0}%
              </span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${total > 0 ? (completed / total) * 100 : 0}%`,
                background: 'linear-gradient(90deg, #f97316, #fbbf24)',
                borderRadius: '99px',
                transition: 'width 0.5s ease',
              }}/>
            </div>
          </div>
        </div>
      </div>

      {/* CHALLENGE GROUPS */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem 4rem' }}>

        {/* Daily */}
        <ChallengeGroup type="daily" challenges={daily} />

        {/* Weekly */}
        <ChallengeGroup type="weekly" challenges={weekly} />

        {/* Season */}
        <ChallengeGroup type="season" challenges={season} />

      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChallengeGroup({ type, challenges }: { type: 'daily' | 'weekly' | 'season'; challenges: any[] }) {
  const meta = TYPE_META[type]
  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Group header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '4px', height: '24px', borderRadius: '2px', background: meta.color, flexShrink: 0 }}/>
        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '14px', letterSpacing: '0.15em', textTransform: 'uppercase', color: meta.color }}>
          {meta.label}
        </span>
        <div style={{ flex: 1, height: '1px', background: `${meta.color}20` }}/>
        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
          {meta.timer}
        </span>
      </div>

      {/* Challenge cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '10px' }}>
        {challenges.map(c => <MissionCard key={c.id} challenge={c} accentColor={meta.color}/>)}
        {challenges.length === 0 && (
          <div style={{
            padding: '24px', textAlign: 'center',
            background: meta.bg, border: `1px dashed ${meta.border}`,
            borderRadius: '12px',
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
            fontSize: '14px', color: 'rgba(255,255,255,0.3)',
          }}>
            No {type} challenges active
          </div>
        )}
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MissionCard({ challenge: c, accentColor }: { challenge: any; accentColor: string }) {
  const progress = c.progress || 0
  const target = c.target || 1
  const pct = Math.min(100, Math.round((progress / target) * 100))
  const isComplete = c.completed || pct >= 100

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      background: isComplete ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isComplete ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '14px',
      overflow: 'hidden',
      transition: 'border-color 0.2s, background 0.2s',
    }}>
      {/* Left accent bar */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: '3px',
        background: isComplete ? '#22c55e' : accentColor,
        borderRadius: '0',
      }}/>

      {/* Top row: icon + title + reward */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Icon */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
          background: isComplete ? 'rgba(34,197,94,0.15)' : `${accentColor}18`,
          border: `1.5px solid ${isComplete ? 'rgba(34,197,94,0.3)' : `${accentColor}33`}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px',
        }}>
          {isComplete ? '✓' : (c.icon || '🎯')}
        </div>

        {/* Title + desc */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 900,
            fontSize: '16px',
            color: isComplete ? 'rgba(255,255,255,0.5)' : 'white',
            textDecoration: isComplete ? 'line-through' : 'none',
            lineHeight: 1.1,
            marginBottom: '4px',
          }}>
            {c.title || c.description}
          </div>
          {c.description && c.title && (
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 600,
              fontSize: '12px',
              color: 'rgba(255,255,255,0.4)',
              lineHeight: 1.3,
            }}>
              {c.description}
            </div>
          )}
        </div>

        {/* Reward */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 900,
            fontSize: '20px',
            color: isComplete ? 'rgba(255,255,255,0.3)' : '#f59e0b',
            lineHeight: 1,
          }}>
            {(c.xp_reward || 250).toLocaleString()}
          </div>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700,
            fontSize: '10px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)',
            marginTop: '2px',
          }}>
            XP
          </div>
        </div>
      </div>

      {/* Progress section */}
      {!isComplete && target > 1 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: accentColor, letterSpacing: '0.08em' }}>
              PROGRESS
            </span>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
              {progress} / {target}
            </span>
          </div>
          <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: accentColor,
              borderRadius: '99px',
              transition: 'width 0.4s ease',
              boxShadow: `0 0 8px ${accentColor}66`,
            }}/>
          </div>
        </div>
      )}

      {/* Complete badge */}
      {isComplete && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '5px 12px',
          background: 'rgba(34,197,94,0.12)',
          border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: '8px',
          alignSelf: 'flex-start',
        }}>
          <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#22c55e' }}>
            ✓ COMPLETED
          </span>
        </div>
      )}
    </div>
  )
}
