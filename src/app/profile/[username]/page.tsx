import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  return { title: `@${params.username} · Draft Day` }
}

const GRADE_COLOR = (ovr: number) =>
  ovr >= 90 ? '#a855f7' : ovr >= 80 ? '#22c55e' : ovr >= 70 ? '#f59e0b' : '#f97316'

const POSITION_COLOR: Record<string, string> = {
  QB: '#f97316', RB: '#22c55e', WR: '#3b82f6', TE: '#a855f7',
  OL: '#f59e0b', DE: '#ef4444', DT: '#ec4899', LB: '#14b8a6',
  CB: '#06b6d4', S: '#8b5cf6', K: '#84cc16', P: '#6366f1',
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: profileRaw } = await supabase.from('profiles').select('*').eq('username', params.username).single()
  if (!profileRaw) notFound()
  const profile = profileRaw as any

  const isOwnProfile = currentUser?.id === profile.id

  const [playersRes, hofRes] = await Promise.all([
    supabase.from('players').select('*, careers(*)').eq('user_id', profile.id).eq('is_active', true).limit(6),
    supabase.from('hall_of_fame').select('*').eq('user_id', profile.id).order('inducted_at', { ascending: false }),
  ])
  const players = playersRes.data as any[] | null
  const hofEntries = hofRes.data as any[] | null

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  const xp = profile.xp ?? 0
  const level = profile.level ?? 1
  const xpInLevel = xp % (level * 1000)
  const xpPct = Math.min(100, (xpInLevel / (level * 1000)) * 100)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-950)' }}>

      {/* PROFILE HERO */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #05080f 0%, #0a111e 60%, #0d1020 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '3rem 2rem 2.5rem',
        overflow: 'hidden',
      }}>
        {/* BG texture */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'repeating-linear-gradient(135deg, white 0, white 1px, transparent 1px, transparent 24px)' }}/>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '-80px', right: '5%', width: '400px', height: '300px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(249,115,22,0.1) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '28px', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: '100px', height: '100px', borderRadius: '20px', flexShrink: 0,
              background: 'rgba(249,115,22,0.12)', border: '2px solid rgba(249,115,22,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '44px', color: '#f97316',
              boxShadow: '0 0 30px rgba(249,115,22,0.15)',
            }}>
              {profile.username[0].toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,3rem)', lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'white' }}>
                  {profile.display_name ?? profile.username}
                </h1>
                {isOwnProfile && (
                  <a href="/settings" style={{ padding: '5px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
                    EDIT PROFILE
                  </a>
                )}
              </div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>
                @{profile.username} · Joined {joinDate}
              </div>
              {profile.bio && (
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 500, fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, maxWidth: '400px', marginBottom: '14px' }}>
                  {profile.bio}
                </div>
              )}

              {/* XP bar */}
              <div style={{ maxWidth: '340px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f97316' }}>Level {level}</span>
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{xp.toLocaleString()} XP total</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${xpPct}%`, background: 'linear-gradient(90deg, #f97316, #f59e0b)', borderRadius: '3px', boxShadow: '0 0 8px rgba(249,115,22,0.4)' }}/>
                </div>
              </div>
            </div>

            {/* Stats cluster */}
            <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
              <StatBadge label="LEVEL" value={String(level)} color="#f97316"/>
              <StatBadge label="HOF" value={String(hofEntries?.length ?? 0)} color="#f59e0b"/>
              <StatBadge label="PLAYERS" value={String(players?.length ?? 0)} color="#22c55e"/>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 2rem 4rem' }}>

        {/* ACTIVE PLAYERS */}
        {players && players.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <SectionLabel label="ACTIVE PLAYERS" color="#f97316"/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
              {players.map((player: any) => {
                const career = Array.isArray(player.careers) ? player.careers[0] : player.careers
                const posColor = POSITION_COLOR[player.position] ?? '#f97316'
                const ovr = player.overall ?? 70
                const gradeC = GRADE_COLOR(ovr)
                return (
                  <div key={player.id} style={{ position: 'relative', padding: '18px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${posColor}20`, borderRadius: '16px', overflow: 'hidden' }}>
                    {/* Top bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${posColor}, ${posColor}50)` }}/>

                    {/* Position badge + OVR */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ padding: '4px 10px', background: `${posColor}18`, border: `1px solid ${posColor}30`, borderRadius: '6px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '12px', color: posColor, letterSpacing: '0.06em' }}>
                        {player.position}
                      </div>
                      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '28px', color: gradeC, lineHeight: 1 }}>
                        {ovr}
                      </div>
                    </div>

                    {/* Jersey + name */}
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '12px', color: `${posColor}80`, marginRight: '6px' }}>#{player.jersey_number ?? '00'}</span>
                      <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '17px', color: 'white', lineHeight: 1 }}>{player.name}</span>
                    </div>
                    {player.nickname && (
                      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', marginBottom: '8px' }}>"{player.nickname}"</div>
                    )}
                    {career?.stage && (
                      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                        {career.stage.replace(/_/g, ' ')}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* HALL OF FAME */}
        {hofEntries && hofEntries.length > 0 && (
          <div>
            <SectionLabel label="HALL OF FAME" color="#f59e0b"/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {hofEntries.map((entry: any) => (
                <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🏛️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '18px', color: 'white', lineHeight: 1 }}>{entry.player_name}</div>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>
                      {entry.position} · {entry.super_bowl_wins ?? 0} Super Bowl{entry.super_bowl_wins !== 1 ? 's' : ''} · Inducted {new Date(entry.inducted_at).getFullYear()}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '32px', color: '#f59e0b', lineHeight: 1 }}>{entry.overall_rating}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {(!players || players.length === 0) && (!hofEntries || hofEntries.length === 0) && (
          <div style={{ padding: '80px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '20px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
              {isOwnProfile ? 'Create your first player to get started' : 'No active players yet'}
            </div>
            {isOwnProfile && (
              <a href="/create-player" style={{ display: 'inline-block', marginTop: '16px', padding: '12px 28px', background: '#f97316', border: 'none', borderRadius: '12px', color: '#05080f', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '15px', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', boxShadow: '0 4px 16px rgba(249,115,22,0.35)' }}>
                CREATE PLAYER
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: '12px 18px', background: `${color}0d`, border: `1px solid ${color}25`, borderRadius: '12px', textAlign: 'center', minWidth: '64px' }}>
      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '28px', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: `${color}80` }}>{label}</div>
    </div>
  )
}

function SectionLabel({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
      <div style={{ width: '4px', height: '18px', borderRadius: '2px', background: color }}/>
      <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: `${color}20` }}/>
    </div>
  )
}
