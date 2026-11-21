import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DraftDayLogo from '@/components/layout/DraftDayLogo'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getProfile(userId: string): Promise<any> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getActiveCareer(userId: string): Promise<any> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('careers')
    .select(`*, players(*)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDailyChallenges(userId: string): Promise<any[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('challenges')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3)
  return data || []
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTopCareers(): Promise<any[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('careers')
    .select(`*, players(*), profiles(username, display_name)`)
    .order('level', { ascending: false })
    .limit(5)
  return data || []
}

function StatPill({ label, value, color = 'var(--accent)' }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      background: 'var(--navy-800)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '0.75rem 1rem',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: '1.6rem', color, lineHeight: 1,
      }}>{value}</div>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 600,
        fontSize: '0.65rem', color: 'var(--charcoal-300)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginTop: '0.25rem',
      }}>{label}</div>
    </div>
  )
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Landing page (unauthenticated)
    return (
      <div style={{ minHeight: '100vh' }}>
        {/* Hero */}
        <section className="hero-bg" style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '6rem 1.5rem 4rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div className="field-lines" />

          {/* Logo */}
          <div style={{ marginBottom: '2.5rem', animation: 'float 4s ease-in-out infinite' }}>
            <DraftDayLogo size={56} variant="icon" />
          </div>

          {/* Badge */}
          <div className="badge badge-orange" style={{ marginBottom: '1.5rem', fontSize: '0.75rem', padding: '0.4rem 1rem' }}>
            ⚡ Football Career Simulator
          </div>

          {/* Headline */}
          <h1 className="text-display-xl" style={{
            maxWidth: 800,
            marginBottom: '1.5rem',
          }}>
            <span style={{ color: 'var(--offwhite)' }}>Your Legacy</span>
            <br />
            <span className="text-gradient-orange">Starts Here</span>
          </h1>

          <p style={{
            maxWidth: 540,
            color: 'var(--charcoal-200)',
            fontSize: '1.1rem',
            lineHeight: 1.6,
            marginBottom: '3rem',
          }}>
            Draft your player through an animated spin mechanic, build your attributes,
            and battle through every stage of a football career — from high school to the Hall of Fame.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/auth/signup" className="btn btn-primary btn-xl" style={{ minWidth: 200 }}>
              Start Your Career
            </Link>
            <Link href="/auth/login" className="btn btn-secondary btn-lg" style={{ minWidth: 160 }}>
              Sign In
            </Link>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center',
            marginTop: '4rem',
            color: 'var(--charcoal-300)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            <span>🏈 12 Positions</span>
            <span>⚡ Spin Mechanic</span>
            <span>🏆 Career Mode</span>
            <span>🎮 Daily Drafts</span>
          </div>
        </section>

        {/* Features */}
        <section style={{
          background: 'var(--navy-900)',
          borderTop: '1px solid var(--border)',
          padding: '5rem 1.5rem',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 className="text-display-lg" style={{ color: 'var(--offwhite)', marginBottom: '0.75rem' }}>
                How It Works
              </h2>
              <p style={{ color: 'var(--charcoal-300)', fontSize: '1rem' }}>
                Draft your legend one spin at a time
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {[
                {
                  step: '01',
                  title: 'Pick Your Position',
                  desc: 'Choose from 12 football positions — each with unique attributes and archetypes.',
                  color: 'var(--accent)',
                },
                {
                  step: '02',
                  title: 'Spin the Wheel',
                  desc: 'The slot machine reveals a player with letter-graded attributes. Pick your favorite.',
                  color: 'var(--green-400)',
                },
                {
                  step: '03',
                  title: 'Build Your Player',
                  desc: 'Accumulate 8 attributes across Physical, Mental, and Skill categories.',
                  color: 'var(--navy-200)',
                },
                {
                  step: '04',
                  title: 'Live the Career',
                  desc: 'From high school to the pros — every decision shapes your legacy.',
                  color: 'var(--accent)',
                },
              ].map(f => (
                <div
                  key={f.step}
                  className="card-elevated"
                  style={{ position: 'relative' }}
                >
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800,
                    fontSize: '3rem', color: 'rgba(255,255,255,0.05)',
                    lineHeight: 1, position: 'absolute', top: '1rem', right: '1.25rem',
                  }}>{f.step}</div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800,
                    fontSize: '0.7rem', letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: f.color,
                    marginBottom: '0.75rem',
                  }}>Step {f.step}</div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800,
                    fontSize: '1.25rem', color: 'var(--offwhite)',
                    marginBottom: '0.6rem', textTransform: 'uppercase',
                  }}>{f.title}</h3>
                  <p style={{ color: 'var(--charcoal-300)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link href="/auth/signup" className="btn btn-primary btn-lg">
                Play Free →
              </Link>
            </div>
          </div>
        </section>

        {/* Game Modes */}
        <section style={{ padding: '5rem 1.5rem', background: 'var(--bg-base)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 className="text-display-lg" style={{ color: 'var(--offwhite)', marginBottom: '0.5rem' }}>
              Game Modes
            </h2>
            <p style={{ color: 'var(--charcoal-300)', marginBottom: '2.5rem' }}>
              Every mode, one goal: build a legend
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { icon: '🏆', name: 'Classic Draft', desc: 'Full career from high school to the pros' },
                { icon: '📅', name: 'Daily Draft', desc: 'Fresh challenge every day — compete globally' },
                { icon: '🎯', name: 'Position Draft', desc: 'Master one position through deep specialization' },
                { icon: '⚡', name: 'Challenge Mode', desc: 'Beat special constraints and earn rewards' },
                { icon: '🔧', name: 'Sandbox', desc: 'Experiment freely, no rules, pure creativity' },
              ].map(m => (
                <div key={m.name} className="card" style={{
                  borderColor: 'var(--border)',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{m.icon}</div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800,
                    fontSize: '1rem', color: 'var(--offwhite)',
                    textTransform: 'uppercase', marginBottom: '0.4rem',
                  }}>{m.name}</h3>
                  <p style={{ color: 'var(--charcoal-300)', fontSize: '0.8rem', lineHeight: 1.5 }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section style={{
          background: 'var(--navy-900)',
          borderTop: '1px solid var(--border)',
          padding: '4rem 1.5rem',
          textAlign: 'center',
        }}>
          <h2 className="text-display-lg" style={{ color: 'var(--offwhite)', marginBottom: '1rem' }}>
            Ready to Be Drafted?
          </h2>
          <p style={{ color: 'var(--charcoal-300)', marginBottom: '2rem' }}>
            Free to play. No download required.
          </p>
          <Link href="/auth/signup" className="btn btn-primary btn-xl">
            Start Your Career Now
          </Link>
        </section>
      </div>
    )
  }

  // Authenticated dashboard
  const [profile, career, challenges, topCareers] = await Promise.all([
    getProfile(user.id),
    getActiveCareer(user.id),
    getDailyChallenges(user.id),
    getTopCareers(),
  ])

  const displayName = profile?.display_name || profile?.username || 'Player'
  const level = profile?.level || 1
  const xp = profile?.xp || 0
  const xpToNext = level * 1000
  const xpPct = Math.min((xp / xpToNext) * 100, 100)
  const player = career?.players as Record<string, unknown> | null

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, paddingBottom: '5rem' }}>
      {/* Top section */}
      <div style={{
        background: 'linear-gradient(180deg, var(--navy-800) 0%, var(--bg-base) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '2rem 1.5rem 2.5rem',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Welcome + XP */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div className="text-label" style={{ color: 'var(--charcoal-300)', marginBottom: '0.35rem' }}>
                Welcome Back
              </div>
              <h1 className="text-display-lg" style={{ color: 'var(--offwhite)', marginBottom: '0.5rem' }}>
                {displayName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge badge-orange">Level {level}</span>
                {profile?.battle_pass_tier && (
                  <span className="badge badge-green">BP Tier {profile.battle_pass_tier}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href="/play" className="btn btn-primary btn-lg">⚡ Play Now</Link>
              <Link href="/create-player" className="btn btn-secondary btn-lg">+ New Player</Link>
            </div>
          </div>

          {/* XP Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span className="text-label" style={{ color: 'var(--charcoal-300)', fontSize: '0.65rem' }}>XP Progress</span>
              <span style={{ color: 'var(--charcoal-300)', fontSize: '0.75rem', fontFamily: 'var(--font-display)' }}>
                {xp.toLocaleString()} / {xpToNext.toLocaleString()}
              </span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>

          {/* Active Player Card */}
          <div style={{ gridColumn: 'span 7' }}>
            <div className="text-label" style={{ color: 'var(--charcoal-400)', marginBottom: '0.75rem' }}>
              Active Player
            </div>
            {player ? (
              <div className="card-elevated">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{
                      fontFamily: 'var(--font-display)', fontWeight: 800,
                      fontSize: '1.6rem', color: 'var(--offwhite)',
                      textTransform: 'uppercase', lineHeight: 1,
                    }}>
                      {String(player.name || 'Your Player')}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <span className="badge badge-orange">{String(player.position || 'QB')}</span>
                      <span className="badge badge-navy">{String(career?.stage || 'High School').replace('_', ' ').toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800,
                    fontSize: '2.5rem', color: 'var(--accent)', lineHeight: 1,
                  }}>
                    {String(player.overall || 70)}
                    <div style={{ fontSize: '0.65rem', color: 'var(--charcoal-300)', textAlign: 'center', marginTop: 2, letterSpacing: '0.08em' }}>OVR</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <StatPill label="Season" value={career?.season || 1} />
                  <StatPill label="Level" value={career?.level || 1} color="var(--green-400)" />
                  <StatPill label="Stage" value={String(career?.stage || 'HS').replace('_', ' ').slice(0, 8)} color="var(--navy-200)" />
                  <StatPill label="XP" value={(career?.xp || 0).toLocaleString()} color="var(--orange-300)" />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link href={`/career`} className="btn btn-primary" style={{ flex: 1 }}>
                    Continue Career →
                  </Link>
                  <Link href="/play" className="btn btn-secondary">
                    Play Match
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card-elevated" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏈</div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: '1.4rem', textTransform: 'uppercase',
                  color: 'var(--offwhite)', marginBottom: '0.5rem',
                }}>
                  No Active Player
                </h3>
                <p style={{ color: 'var(--charcoal-300)', marginBottom: '1.5rem' }}>
                  Draft your first player to begin your football career
                </p>
                <Link href="/create-player" className="btn btn-primary btn-lg">
                  ⚡ Draft a Player
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions + Stats */}
          <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Profile stats */}
            <div>
              <div className="text-label" style={{ color: 'var(--charcoal-400)', marginBottom: '0.75rem' }}>
                Your Stats
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <StatPill label="Coins" value={(profile?.coins || 0).toLocaleString()} color="var(--orange-300)" />
                <StatPill label="BP Tier" value={profile?.battle_pass_tier || 1} color="var(--green-400)" />
              </div>
            </div>

            {/* Daily Challenges */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div className="text-label" style={{ color: 'var(--charcoal-400)' }}>Daily Challenges</div>
                <Link href="/challenges" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  View All →
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {challenges.length > 0 ? (
                  challenges.slice(0, 3).map((c: Record<string, unknown>, i: number) => (
                    <div key={i} className="card" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--charcoal-200)' }}>
                        {String(c.title || `Challenge ${i + 1}`)}
                      </span>
                      <span className="badge badge-orange">+{String(c.xp_reward || 100)} XP</span>
                    </div>
                  ))
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '1rem', color: 'var(--charcoal-400)', fontSize: '0.85rem' }}>
                    No active challenges
                  </div>
                )}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <div className="text-label" style={{ color: 'var(--charcoal-400)', marginBottom: '0.75rem' }}>Quick Access</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {[
                  { href: '/battle-pass', label: 'Battle Pass', icon: '⭐' },
                  { href: '/leaderboards', label: 'Leaderboard', icon: '🏆' },
                  { href: '/friends', label: 'Friends', icon: '👥' },
                  { href: '/shop', label: 'Shop', icon: '🛍️' },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="card"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.75rem 1rem',
                      fontFamily: 'var(--font-display)', fontWeight: 700,
                      fontSize: '0.85rem', color: 'var(--charcoal-200)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{item.icon}</span> {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard preview */}
          <div style={{ gridColumn: 'span 12' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div className="text-label" style={{ color: 'var(--charcoal-400)' }}>Top Careers</div>
              <Link href="/leaderboards" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                Full Leaderboard →
              </Link>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {topCareers.length > 0 ? (
                topCareers.map((c: Record<string, unknown>, i: number) => {
                  const p = c.players as Record<string, unknown> | null
                  const prof = c.profiles as Record<string, unknown> | null
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.9rem 1.25rem',
                        borderBottom: i < topCareers.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 800,
                        fontSize: '1.1rem', width: 28, textAlign: 'center',
                        color: i === 0 ? '#fbbf24' : i === 1 ? '#d1d5db' : i === 2 ? '#cd7c3f' : 'var(--charcoal-400)',
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontWeight: 700,
                          fontSize: '0.95rem', color: 'var(--offwhite)',
                        }}>
                          {String(p?.name || 'Unknown Player')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--charcoal-300)' }}>
                          {String(prof?.display_name || prof?.username || 'Player')} · {String(p?.position || 'QB')}
                        </div>
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 800,
                        fontSize: '1.3rem', color: 'var(--accent)',
                      }}>
                        {String(p?.overall || 70)} OVR
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700,
                        fontSize: '0.8rem', color: 'var(--charcoal-300)',
                      }}>
                        Lv. {String(c.level || 1)}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--charcoal-400)', fontSize: '0.9rem' }}>
                  No careers yet — be the first!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
