import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Challenges' }

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

  const completed = challenges.filter(c => c.completed)
  const active = challenges.filter(c => !c.completed)

  const defaultChallenges = [
    { id: 'dc1', title: 'Complete 3 Games', description: 'Play and finish 3 games in any career', xp_reward: 250, type: 'daily', progress: 0, target: 3, completed: false },
    { id: 'dc2', title: 'Throw for 200 Yards', description: 'Complete a game with 200+ passing yards', xp_reward: 300, type: 'daily', progress: 1, target: 1, completed: false },
    { id: 'dc3', title: 'Make 2 Field Goals', description: 'Successfully kick 2 field goals in one game', xp_reward: 250, type: 'daily', progress: 0, target: 2, completed: false },
    { id: 'wc1', title: 'Reach Season 3', description: 'Progress your career to Season 3', xp_reward: 500, type: 'weekly', progress: 1, target: 1, completed: false },
    { id: 'wc2', title: 'Score 10 Touchdowns', description: 'Accumulate 10 touchdowns across any games', xp_reward: 750, type: 'weekly', progress: 4, target: 10, completed: false },
    { id: 'sc1', title: 'Draft a Legend', description: 'Create a player with 90+ overall rating', xp_reward: 1000, type: 'season', progress: 0, target: 1, completed: false },
  ]

  const displayChallenges = challenges.length > 0 ? challenges : defaultChallenges
  const dailyChallenges = displayChallenges.filter(c => c.type === 'daily' || (!c.type && true)).slice(0, 3)
  const weeklyChallenges = displayChallenges.filter(c => c.type === 'weekly').slice(0, 2)
  const seasonChallenges = displayChallenges.filter(c => c.type === 'season').slice(0, 2)

  // If no type info, split into groups
  const allChallenges = challenges.length > 0 ? challenges : defaultChallenges

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--orange-400)', marginBottom: '0.4rem' }}>
            Challenges
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,2.75rem)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Daily <span style={{ color: 'var(--orange-500)' }}>Missions</span>
          </h1>
        </div>

        {/* Timer and progress */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--orange-400)', lineHeight: 1 }}>3h 24m</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Daily Reset</div>
          </div>
          <div className="card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--gold-400)', lineHeight: 1 }}>
              {completed.length}/{challenges.length || defaultChallenges.length}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Completed</div>
          </div>
        </div>
      </div>

      {/* Daily challenges */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>⚡ Daily</div>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Resets in 3h 24m</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(allChallenges.slice(0, 3)).map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      </div>

      {/* Weekly challenges */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>📅 Weekly</div>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>4d 12h remaining</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(allChallenges.slice(3, 5)).map((c) => (
            <ChallengeCard key={c.id} challenge={c} accent="var(--gold-500)" />
          ))}
        </div>
      </div>

      {/* Season challenges */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>🏆 Season</div>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(allChallenges.slice(5)).map((c) => (
            <ChallengeCard key={c.id} challenge={c} accent="var(--navy-200)" />
          ))}
          {allChallenges.slice(5).length === 0 && (
            <ChallengeCard challenge={{ id: 's1', title: 'Draft a Legend', description: 'Create a player with 90+ overall rating', xp_reward: 1000, progress: 0, target: 1, completed: false }} accent="var(--navy-200)" />
          )}
        </div>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChallengeCard({ challenge: c, accent = 'var(--orange-500)' }: { challenge: any; accent?: string }) {
  const progress = c.progress || 0
  const target = c.target || 1
  const pct = Math.min(100, Math.round((progress / target) * 100))
  const isComplete = c.completed || pct >= 100

  return (
    <div className={`challenge-card${isComplete ? ' complete' : ''}`}
      style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>

      {/* Status icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--r-md)', flexShrink: 0,
        background: isComplete ? 'rgba(34,197,94,0.15)' : `${accent}18`,
        border: `1.5px solid ${isComplete ? 'rgba(34,197,94,0.3)' : `${accent}33`}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isComplete
          ? <CheckCircleSVG />
          : <TaskSVG color={accent} />
        }
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: isComplete ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isComplete ? 'line-through' : 'none' }}>
            {c.title || c.description}
          </span>
          {isComplete && <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>✓ Done</span>}
        </div>
        {c.description && c.title && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{c.description}</div>
        )}
        {/* Progress bar */}
        {!isComplete && target > 1 && (
          <div>
            <div className="stat-bar-track" style={{ marginBottom: '0.25rem' }}>
              <div className="stat-bar-fill" style={{ width: `${pct}%`, background: accent }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {progress} / {target}
            </div>
          </div>
        )}
      </div>

      {/* Reward */}
      <div style={{ display: 'flex', flex: 'column', alignItems: 'center', gap: '0.3rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', color: isComplete ? 'var(--text-muted)' : 'var(--gold-400)' }}>
          {c.xp_reward || 250}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>coins</div>
      </div>
    </div>
  )
}

function CheckCircleSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="10" fill="rgba(34,197,94,0.2)" stroke="rgba(34,197,94,0.5)" strokeWidth="1.5"/>
      <path d="M7 11l3 3 5-6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function TaskSVG({ color = 'var(--orange-500)' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke={color} strokeWidth="1.5" fill={`${color}15`}/>
      <path d="M6 8h8M6 12h5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
