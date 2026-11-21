import React from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function DashCard({ children, accent, topBar }: { children: React.ReactNode; accent: string; topBar?: boolean }) {
  return (
    <div style={{ background: '#0a0d14', border: `1px solid ${accent}22`, borderRadius: '14px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
      {topBar && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: accent, opacity: 0.7 }}/>}
      {children}
    </div>
  )
}

function CardLabel({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
      <div style={{ width: '3px', height: '14px', background: color, borderRadius: '2px', flexShrink: 0 }}/>
      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color }}>{label}</div>
    </div>
  )
}

async function getData(userId: string) {
  const supabase = createClient()
  const [profileRes, careerRes, challengesRes, topCareersRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('careers').select('*, players(*)').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('challenges').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
    supabase.from('careers').select('*, players(*), profiles(username, display_name)').order('level', { ascending: false }).limit(3),
  ])
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile: profileRes.data as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    career: careerRes.data as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    challenges: (challengesRes.data || []) as any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    topCareers: (topCareersRes.data || []) as any[],
  }
}

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <LandingPage />

  const { profile, career, challenges, topCareers } = await getData(user.id)
  const xpInLevel = profile?.xp ? profile.xp % 1000 : 0
  const xpPct = Math.round(xpInLevel / 10)

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1200, margin: '0 auto' }}>

      {/* Stadium hero */}
      <div className="stadium-hero" style={{ borderRadius: 'var(--r-xl)', marginBottom: '1.5rem', overflow: 'hidden', minHeight: 300 }}>
        <div className="stadium-bg" />
        <div className="field-lines" />

        {/* Football field texture lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 50px)',
          pointerEvents: 'none',
        }} />

        {/* Player silhouette art */}
        <div style={{ position: 'absolute', right: '8%', bottom: 0, height: '95%', display: 'flex', alignItems: 'flex-end' }}>
          <FootballPlayerSVG />
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, padding: '2.5rem 2.5rem', maxWidth: 560 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--orange-400)', marginBottom: '0.5rem' }}>
            FOOTBALL CAREER SIMULATOR
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2.5rem,5vw,4rem)', lineHeight: 0.95, letterSpacing: '-0.01em', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--off-white)', display: 'block' }}>DRAFT DAY</span>
            <span style={{ color: 'var(--orange-500)', display: 'block' }}>BUILD. COMPETE.</span>
            <span style={{ color: 'var(--off-white)', display: 'block' }}>DOMINATE.</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1.5rem', maxWidth: 400, lineHeight: 1.5 }}>
            Create your player, build a career, and become a legend.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {career ? (
              <Link href={`/career/${career.id}`} className="btn btn-primary btn-lg">
                <PlayTriangle /> Continue Career
              </Link>
            ) : (
              <Link href="/create-player" className="btn btn-primary btn-lg">
                <PlayTriangle /> Start Building
              </Link>
            )}
            <Link href="/play" className="btn btn-ghost btn-lg">View Game Modes</Link>
          </div>
        </div>

        {/* Profile stats overlay top-right */}
        {profile && (
          <div style={{
            position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 5,
            background: 'rgba(5,8,15,0.75)', backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-bright)', borderRadius: 'var(--r-lg)',
            padding: '1rem 1.25rem', minWidth: 200,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>YOUR PROFILE</div>
              <Link href={`/profile/${profile.username}`} style={{ fontSize: '0.7rem', color: 'var(--orange-400)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>View →</Link>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              {profile.display_name || profile.username}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
              {[
                { label: 'OVR', value: career?.players?.overall || '—' },
                { label: 'CAREER WINS', value: career?.wins || 0 },
                { label: 'COINS', value: (profile.coins || 0).toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '0.3rem' }}>
              LVL {profile.level} &nbsp;·&nbsp; {xpInLevel} / 1,000 XP
            </div>
            <div className="xp-bar"><div className="xp-fill" style={{ width: `${xpPct}%` }} /></div>
          </div>
        )}
      </div>

      {/* Row 1: Create Player + Career + Challenges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '12px' }}>

        {/* Create Player */}
        <DashCard accent="#f97316" topBar>
          <CardLabel label="CREATE YOUR PLAYER" color="#f97316"/>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '22px', color: 'white', lineHeight: 1, marginBottom: '8px' }}>SPIN THE WHEEL</div>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 500, fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4, marginBottom: '14px' }}>
            Spin to generate a random football player and build your ultimate athlete!
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <MiniWheelSVG />
          </div>
          <Link href="/create-player" style={{ display: 'block', padding: '10px', background: '#f97316', borderRadius: '10px', color: '#05080f', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '14px', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', textDecoration: 'none', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}>
            SPIN NOW
          </Link>
        </DashCard>

        {/* Career */}
        <DashCard accent="#a855f7" topBar>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <CardLabel label="YOUR CAREER" color="#a855f7"/>
            <Link href="/career" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: '#a855f7', textDecoration: 'none' }}>VIEW →</Link>
          </div>
          {career ? (
            <>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '28px', color: 'white', lineHeight: 1, marginBottom: '4px' }}>
                {career.players?.name ?? 'No Name'}
              </div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
                Season {career.season ?? 1} · {(career.stage ?? 'nfl').replace(/_/g, ' ').toUpperCase()}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '14px' }}>
                {[
                  { label: 'OVR', value: career.players?.overall ?? 70, color: '#a855f7' },
                  { label: 'TDs', value: career.touchdowns ?? 0, color: 'white' },
                  { label: 'WINS', value: career.wins ?? 0, color: 'white' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '20px', color, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                <div style={{ height: '100%', width: `${Math.min(100, ((career.games_played ?? 0) / 14) * 100)}%`, background: 'linear-gradient(90deg, #a855f7, #c084fc)', borderRadius: '3px' }}/>
              </div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                {career.games_played ?? 0} / 14 games this season
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '14px', color: 'rgba(255,255,255,0.3)', marginBottom: '14px' }}>No active career yet</div>
              <Link href="/create-player" style={{ padding: '9px 20px', background: '#a855f7', border: 'none', borderRadius: '10px', color: 'white', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px', letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none' }}>START CAREER</Link>
            </div>
          )}
        </DashCard>

        {/* Daily Challenges */}
        <DashCard accent="#f97316" topBar>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <CardLabel label="DAILY CHALLENGES" color="#f97316"/>
            <Link href="/challenges" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: '#f97316', textDecoration: 'none' }}>ALL →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            {(challenges.length > 0 ? challenges : [
              { title: 'Complete 3 Games', xp_reward: 250, completed: false },
              { title: 'Score 2 Touchdowns', xp_reward: 300, completed: false },
              { title: 'Make 10 Tackles', xp_reward: 250, completed: false },
            ]).map((c: any, i: number) => (
              <div key={c.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: c.completed ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${c.completed ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '5px', background: c.completed ? '#22c55e' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {c.completed && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                </div>
                <div style={{ flex: 1, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', color: c.completed ? 'rgba(255,255,255,0.4)' : 'white', textDecoration: c.completed ? 'line-through' : 'none' }}>
                  {c.title ?? c.description ?? 'Complete challenge'}
                </div>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '12px', color: '#f59e0b' }}>+{c.xp_reward ?? 250}</div>
              </div>
            ))}
          </div>
          <Link href="/challenges" style={{ display: 'block', padding: '9px', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '10px', color: '#f97316', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center', textDecoration: 'none' }}>
            VIEW ALL MISSIONS
          </Link>
        </DashCard>
      </div>

      {/* Row 2: Battle Pass + Shop + Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '12px' }}>

        {/* Battle Pass */}
        <DashCard accent="#f59e0b" topBar>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <CardLabel label="⭐ BATTLE PASS" color="#f59e0b"/>
            <Link href="/battle-pass" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: '#f59e0b', textDecoration: 'none' }}>VIEW →</Link>
          </div>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '32px', color: '#f59e0b', lineHeight: 1, marginBottom: '4px' }}>Tier {profile?.battle_pass_tier ?? 1}</div>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>Season 1 · Gridiron Glory</div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
            <div style={{ height: '100%', width: `${(((profile?.battle_pass_tier ?? 1) * 312) % 1000) / 10}%`, background: 'linear-gradient(90deg, #d97706, #f59e0b)', borderRadius: '4px', boxShadow: '0 0 8px rgba(245,158,11,0.4)' }}/>
          </div>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '14px' }}>
            {((profile?.battle_pass_tier ?? 1) * 312) % 1000} / 1,000 XP to next tier
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[{ label: 'DD Helmet', tier: profile?.battle_pass_tier ?? 1, cur: true }, { label: 'Player Skin', tier: (profile?.battle_pass_tier ?? 1) + 1 }, { label: '2× XP', tier: (profile?.battle_pass_tier ?? 1) + 2, gold: true }].map((r) => (
              <div key={r.tier} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', background: r.cur ? 'rgba(249,115,22,0.1)' : r.gold ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${r.cur ? 'rgba(249,115,22,0.3)' : r.gold ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '8px' }}>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '10px', color: r.cur ? '#f97316' : r.gold ? '#f59e0b' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>T{r.tier}</div>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '11px', color: r.cur ? 'white' : 'rgba(255,255,255,0.5)' }}>{r.label}</div>
              </div>
            ))}
          </div>
        </DashCard>

        {/* Shop */}
        <DashCard accent="#a855f7" topBar>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <CardLabel label="THE SHOP" color="#a855f7"/>
            <Link href="/shop" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: '#a855f7', textDecoration: 'none' }}>VISIT →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            {[
              { name: 'Elite Gold Helmet', price: 2400, rarity: 'legendary', color: '#f59e0b' },
              { name: 'Carbon Visor',      price: 800,  rarity: 'rare',      color: '#3b82f6' },
              { name: 'Victory Emote',     price: 1200, rarity: 'epic',      color: '#a855f7' },
            ].map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${item.color}20`, borderRadius: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, flexShrink: 0 }}/>
                <div style={{ flex: 1, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px', color: 'white' }}>{item.name}</div>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px', color: '#f59e0b' }}>{item.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', marginBottom: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth="1"/><text x="10" y="14" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="10" fill="#f59e0b">$</text></svg>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '20px', color: '#f59e0b', lineHeight: 1 }}>{(profile?.coins ?? 0).toLocaleString()}</span>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: 'rgba(245,158,11,0.6)', textTransform: 'uppercase' }}>coins</span>
          </div>
          <Link href="/shop" style={{ display: 'block', padding: '9px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '10px', color: '#a855f7', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center', textDecoration: 'none' }}>
            OPEN SHOP
          </Link>
        </DashCard>

        {/* Leaderboard */}
        <DashCard accent="#f59e0b" topBar>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <CardLabel label="👑 TOP PLAYERS" color="#f59e0b"/>
            <Link href="/leaderboards" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: '#f59e0b', textDecoration: 'none' }}>BOARD →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            {topCareers.length > 0 ? topCareers.slice(0, 3).map((c: any, i: number) => {
              const rankColors = ['#f59e0b', '#94a3b8', '#cd7c46']
              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: i === 0 ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: `${rankColors[i]}20`, border: `1px solid ${rankColors[i]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '13px', color: rankColors[i], flexShrink: 0 }}>{i+1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px', color: 'white', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.players?.name ?? 'Unknown'}</div>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>@{c.profiles?.username ?? '—'}</div>
                  </div>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '20px', color: i === 0 ? '#f59e0b' : 'rgba(255,255,255,0.6)', lineHeight: 1 }}>{c.players?.overall ?? c.level * 3 + 60}</div>
                </div>
              )
            }) : (
              <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>No rankings yet — be first!</div>
            )}
          </div>
          <Link href="/leaderboards" style={{ display: 'block', padding: '9px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', color: '#f59e0b', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center', textDecoration: 'none' }}>
            FULL LEADERBOARD
          </Link>
        </DashCard>
      </div>

      <div style={{ height: '2rem' }}/>
    </div>
  )
}

/* ── LANDING PAGE (unauthenticated) ── */
function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <div className="stadium-hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div className="stadium-bg" />
        <div className="field-lines" />

        {/* Animated glow */}
        <div style={{
          position: 'absolute', top: '20%', right: '15%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Hero player */}
        <div style={{ position: 'absolute', right: '5%', bottom: 0, height: '90%' }}>
          <LargeFootballPlayerSVG />
        </div>

        <div style={{ position: 'relative', zIndex: 2, padding: '2.5rem', maxWidth: 600 }}>
          <div className="badge badge-orange" style={{ marginBottom: '1.5rem', fontSize: '0.75rem' }}>
            ⚡ FOOTBALL CAREER SIMULATOR
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(3.5rem,8vw,6rem)', lineHeight: 0.9, letterSpacing: '-0.02em',
            marginBottom: '1.5rem',
          }}>
            <span style={{ display: 'block', color: 'var(--off-white)' }}>YOUR</span>
            <span style={{ display: 'block', color: 'var(--orange-500)' }}>LEGACY</span>
            <span style={{ display: 'block', color: 'var(--off-white)' }}>STARTS</span>
            <span style={{ display: 'block', color: 'var(--off-white)' }}>HERE</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: 420, lineHeight: 1.6 }}>
            Draft your player through an animated spin mechanic, build your attributes, and battle through every stage of a football career — from high school to the Hall of Fame.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/auth/signup" className="btn btn-primary btn-xl">
              <PlayTriangle /> Start Your Career
            </Link>
            <Link href="/auth/login" className="btn btn-ghost btn-xl">Sign In</Link>
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {['12 Positions', 'Spin Mechanic', 'Career Mode', 'Daily Drafts'].map(f => (
              <div key={f} className="badge badge-navy" style={{ fontSize: '0.75rem' }}>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div style={{ padding: '5rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="section-label" style={{ marginBottom: '0.5rem' }}>How It Works</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Draft Your Legend<br /><span style={{ color: 'var(--orange-500)' }}>One Spin At A Time</span>
          </h2>
        </div>

        <div className="grid-4">
          {[
            { n: '01', title: 'Pick Your Position', desc: 'Choose from 12 football positions — each with unique attributes and archetypes.' },
            { n: '02', title: 'Spin the Wheel', desc: 'The slot machine reveals a player with letter-graded attributes. Pick your favorite.' },
            { n: '03', title: 'Build Your Player', desc: 'Accumulate 8 attributes across Physical, Mental, and Skill categories.' },
            { n: '04', title: 'Live the Career', desc: 'From high school to the pros — every decision shapes your legacy.' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="card" style={{ padding: '1.75rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', color: 'rgba(249,115,22,0.15)', lineHeight: 1, marginBottom: '0.75rem' }}>{n}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Game modes */}
      <div style={{ padding: '0 2.5rem 5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="section-label" style={{ marginBottom: '0.5rem' }}>Game Modes</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Every Mode,<br /><span style={{ color: 'var(--orange-500)' }}>One Goal: Build a Legend</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.75rem' }}>
          {[
            { icon: '🏆', name: 'Classic Draft', desc: 'Full career from high school to the pros', accent: 'var(--orange-500)' },
            { icon: '📅', name: 'Daily Draft', desc: 'Fresh challenge every day — compete globally', accent: 'var(--navy-400)' },
            { icon: '🎯', name: 'Position Draft', desc: 'Master one position through deep specialization', accent: 'var(--green-500)' },
            { icon: '⚡', name: 'Challenge Mode', desc: 'Beat special constraints and earn rewards', accent: 'var(--gold-500)' },
            { icon: '🔧', name: 'Sandbox', desc: 'Experiment freely, no rules, pure creativity', accent: 'var(--red-500)' },
          ].map(({ icon, name, desc, accent }) => (
            <div key={name} className="card card-hover" style={{ padding: '1.25rem', borderTop: `3px solid ${accent}` }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>{name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/auth/signup" className="btn btn-primary btn-xl">Start Your Career Now →</Link>
        </div>
      </div>
    </div>
  )
}

/* ── SVG ARTWORK ── */

function PlayTriangle() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: 2 }}>
      <path d="M2 1.5l9 4.5-9 4.5V1.5z" fill="currentColor"/>
    </svg>
  )
}

function CoinSVGSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
      <text x="8" y="12" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="9" fill="#78350f">$</text>
    </svg>
  )
}

function FootballIconSVG() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <ellipse cx="24" cy="24" rx="20" ry="13" fill="#6b4226" stroke="#4a2c14" strokeWidth="2"/>
      <line x1="8" y1="24" x2="40" y2="24" stroke="white" strokeWidth="1.5"/>
      <line x1="20" y1="17" x2="20" y2="31" stroke="white" strokeWidth="1.5"/>
      <line x1="28" y1="17" x2="28" y2="31" stroke="white" strokeWidth="1.5"/>
    </svg>
  )
}

function FootballPlayerSVG() {
  /* Stylized player silhouette in orange/white — running back pose */
  return (
    <svg width="220" height="320" viewBox="0 0 220 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9 }}>
      {/* Shadow */}
      <ellipse cx="110" cy="310" rx="80" ry="8" fill="rgba(0,0,0,0.3)" />
      {/* Legs */}
      <path d="M85 220 L70 290 L85 292 L100 240 L120 285 L135 282 L115 220 Z" fill="#1c3360"/>
      {/* Body / jersey */}
      <path d="M70 150 L150 150 L155 220 L65 220 Z" fill="#f97316"/>
      {/* Jersey number */}
      <text x="110" y="195" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="32" fill="rgba(255,255,255,0.9)">1</text>
      {/* Arms */}
      <path d="M70 155 L40 190 L50 200 L80 170 Z" fill="#1c3360"/>
      <path d="M150 155 L175 185 L165 195 L140 170 Z" fill="#f97316"/>
      {/* Neck */}
      <rect x="100" y="128" width="20" height="24" rx="4" fill="#c8a882"/>
      {/* Helmet */}
      <ellipse cx="110" cy="110" rx="38" ry="40" fill="#1c3360"/>
      {/* Helmet visor */}
      <path d="M75 115 Q110 95 145 115" stroke="#f97316" strokeWidth="4" fill="none"/>
      {/* Facemask */}
      <path d="M78 118 L82 138 M90 112 L92 140 M128 112 L130 140 M140 118 L144 138" stroke="#8aaad4" strokeWidth="2.5"/>
      <path d="M82 138 L144 138" stroke="#8aaad4" strokeWidth="2.5"/>
      {/* Helmet logo */}
      <circle cx="110" cy="105" r="12" fill="rgba(249,115,22,0.3)" stroke="rgba(249,115,22,0.6)" strokeWidth="1.5"/>
      <text x="110" y="110" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="10" fill="#f97316">DD</text>
      {/* Football */}
      <ellipse cx="168" cy="175" rx="18" ry="11" fill="#6b4226" stroke="#4a2c14" strokeWidth="1.5" transform="rotate(-20 168 175)"/>
      <line x1="156" y1="173" x2="180" y2="177" stroke="white" strokeWidth="1" transform="rotate(-20 168 175)"/>
      {/* Gloves */}
      <ellipse cx="40" cy="202" rx="10" ry="8" fill="#1c3360"/>
      <ellipse cx="175" cy="188" rx="10" ry="8" fill="#f97316" transform="rotate(-15 175 188)"/>
      {/* Shoes */}
      <ellipse cx="75" cy="292" rx="15" ry="6" fill="#0a1628"/>
      <ellipse cx="128" cy="284" rx="15" ry="6" fill="#0a1628" transform="rotate(10 128 284)"/>
    </svg>
  )
}

function LargeFootballPlayerSVG() {
  /* Bigger version for landing page hero */
  return (
    <svg width="400" height="580" viewBox="0 0 220 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
      {/* Shadow */}
      <ellipse cx="110" cy="314" rx="85" ry="6" fill="rgba(0,0,0,0.4)" />
      {/* Legs */}
      <path d="M85 220 L65 295 L82 297 L100 240 L122 288 L138 285 L115 220 Z" fill="#122552"/>
      {/* Body */}
      <path d="M68 148 L152 148 L158 222 L62 222 Z" fill="#f97316"/>
      {/* Orange shoulder pads area */}
      <path d="M62 148 L80 160 L80 148 Z" fill="#ea580c"/>
      <path d="M158 148 L140 160 L140 148 Z" fill="#ea580c"/>
      {/* Jersey stripes */}
      <path d="M68 148 L152 148 L152 160 L68 160 Z" fill="#ea580c" opacity="0.5"/>
      {/* Jersey number */}
      <text x="110" y="200" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="40" fill="rgba(255,255,255,0.95)">1</text>
      {/* Arms */}
      <path d="M68 155 L35 198 L48 208 L78 173 Z" fill="#122552"/>
      <path d="M152 155 L180 192 L168 202 L142 172 Z" fill="#f97316"/>
      {/* Neck */}
      <rect x="99" y="126" width="22" height="24" rx="5" fill="#c8a882"/>
      {/* Helmet */}
      <ellipse cx="110" cy="108" rx="40" ry="42" fill="#122552"/>
      {/* Helmet shine */}
      <ellipse cx="96" cy="90" rx="14" ry="10" fill="rgba(255,255,255,0.06)" transform="rotate(-20 96 90)"/>
      {/* Visor / bar */}
      <path d="M74 115 Q110 93 146 115" stroke="#f97316" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      {/* Facemask bars */}
      <path d="M78 120 L80 142 M90 113 L93 143 M127 113 L130 143 M142 120 L144 142" stroke="#8aaad4" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M80 142 L144 142" stroke="#8aaad4" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M80 132 L144 132" stroke="#8aaad4" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Helmet logo */}
      <circle cx="110" cy="102" r="14" fill="rgba(249,115,22,0.25)" stroke="rgba(249,115,22,0.5)" strokeWidth="1.5"/>
      <text x="110" y="108" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="12" fill="#f97316">DD</text>
      {/* Football */}
      <ellipse cx="170" cy="180" rx="20" ry="12" fill="#7c4f2a" stroke="#5a3519" strokeWidth="2" transform="rotate(-25 170 180)"/>
      <line x1="156" y1="177" x2="184" y2="183" stroke="white" strokeWidth="1.2" transform="rotate(-25 170 180)"/>
      <line x1="166" y1="168" x2="162" y2="192" stroke="white" strokeWidth="1" transform="rotate(-25 170 180)"/>
      {/* Gloves */}
      <ellipse cx="38" cy="208" rx="12" ry="9" fill="#122552"/>
      <ellipse cx="176" cy="195" rx="12" ry="9" fill="#f97316" transform="rotate(-20 176 195)"/>
      {/* Shoes */}
      <path d="M60 294 Q68 302 90 300 L90 292 Q75 294 68 288 Z" fill="#05080f"/>
      <path d="M118 288 Q128 296 148 292 L148 285 Q138 288 128 282 Z" fill="#05080f"/>
    </svg>
  )
}

function MiniWheelSVG() {
  const positions = ['QB', 'RB', 'WR', 'TE', 'LB', 'CB', 'DE', 'S']
  const colors = ['#f97316','#1c3360','#22c55e','#f59e0b','#3b82f6','#8b5cf6','#ef4444','#ec4899']
  const r = 60, cx = 70, cy = 70
  const sliceAngle = (2 * Math.PI) / 8

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r + 4} fill="rgba(249,115,22,0.15)" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5"/>
      {/* Segments */}
      {positions.map((pos, i) => {
        const startAngle = i * sliceAngle - Math.PI / 2
        const endAngle = startAngle + sliceAngle
        const x1 = cx + r * Math.cos(startAngle)
        const y1 = cy + r * Math.sin(startAngle)
        const x2 = cx + r * Math.cos(endAngle)
        const y2 = cy + r * Math.sin(endAngle)
        const midAngle = startAngle + sliceAngle / 2
        const lx = cx + (r * 0.68) * Math.cos(midAngle)
        const ly = cy + (r * 0.68) * Math.sin(midAngle)
        return (
          <g key={pos}>
            <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
              fill={colors[i]} opacity="0.85" stroke="rgba(5,8,15,0.5)" strokeWidth="1.5"/>
            <text x={lx} y={ly + 1} textAnchor="middle" dominantBaseline="middle"
              fontFamily="Barlow Condensed,sans-serif" fontWeight="800" fontSize="8" fill="#fff" letterSpacing="0.04em">
              {pos}
            </text>
          </g>
        )
      })}
      {/* Center */}
      <circle cx={cx} cy={cy} r={18} fill="#05080f" stroke="rgba(249,115,22,0.4)" strokeWidth="2"/>
      <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle"
        fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="10" fill="#f97316">DD</text>
      {/* Pointer */}
      <polygon points={`${cx},${cy - r - 12} ${cx - 7},${cy - r + 2} ${cx + 7},${cy - r + 2}`} fill="#f97316"/>
    </svg>
  )
}

function BattlePassRewardSVG({ current }: { current: boolean }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="8" width="32" height="24" rx="4" fill={current ? 'rgba(249,115,22,0.2)' : 'var(--navy-700)'} stroke={current ? 'rgba(249,115,22,0.4)' : 'var(--border)'} strokeWidth="1.5"/>
      <text x="20" y="24" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="10" fill={current ? '#f97316' : '#4a5a72'}>DD</text>
    </svg>
  )
}

function BattlePassGoldRewardSVG() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="8" width="32" height="24" rx="4" fill="rgba(245,158,11,0.2)" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5"/>
      <text x="20" y="22" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="9" fill="#f59e0b">2×</text>
      <text x="20" y="30" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="700" fontSize="7" fill="#f59e0b">XP</text>
    </svg>
  )
}

function ShopItemSVG({ rarity }: { rarity: string }) {
  const color = rarity === 'rarity-epic' ? '#8b5cf6' : rarity === 'rarity-rare' ? '#3b82f6' : '#3a5a99'
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="2" y="2" width="32" height="32" rx="6" fill={`${color}22`} stroke={`${color}44`} strokeWidth="1.5"/>
      <ellipse cx="18" cy="14" rx="8" ry="6" fill={color} opacity="0.8"/>
      <rect x="10" y="20" width="16" height="8" rx="2" fill={color} opacity="0.6"/>
    </svg>
  )
}
