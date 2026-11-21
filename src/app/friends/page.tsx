import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Friends · Draft Day' }

export default async function FriendsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: friendshipsRaw } = await supabase
    .from('friendships')
    .select(`
      *,
      requester:profiles!friendships_requester_id_fkey(id, username, display_name, level),
      addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, level)
    `)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .neq('status', 'blocked')
  const friendships = friendshipsRaw as any[] | null

  const accepted = friendships?.filter((f: any) => f.status === 'accepted') ?? []
  const incoming = friendships?.filter((f: any) => f.status === 'pending' && f.addressee_id === user.id) ?? []
  const outgoing = friendships?.filter((f: any) => f.status === 'pending' && f.requester_id === user.id) ?? []

  const getFriend = (f: any) => f.requester_id === user.id ? f.addressee : f.requester

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-950)' }}>

      {/* HEADER */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #05080f 0%, #0a111e 60%, #0d1020 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '2.5rem 2rem 2rem',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'repeating-linear-gradient(90deg, white 0, white 1px, transparent 1px, transparent 60px), repeating-linear-gradient(0deg, white 0, white 1px, transparent 1px, transparent 60px)' }}/>
        <div style={{ position: 'absolute', top: '-60px', right: '10%', width: '300px', height: '200px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', marginBottom: '14px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '6px' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#3b82f6" strokeWidth="1.5"/><path d="M3 9c0-3 6-3 6 0" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round"/><circle cx="6" cy="4.5" r="1.5" fill="#3b82f6"/></svg>
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.15em', color: '#3b82f6', textTransform: 'uppercase' }}>SOCIAL HUB</span>
              </div>
              <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 'clamp(2.5rem,6vw,4.5rem)', lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'white' }}>FRIENDS</h1>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Stat label="FRIENDS" value={String(accepted.length)} color="#3b82f6"/>
              {incoming.length > 0 && <Stat label="REQUESTS" value={String(incoming.length)} color="#f97316"/>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 2rem 4rem' }}>

        {/* ADD FRIEND */}
        <div style={{ marginBottom: '28px' }}>
          <SectionLabel label="ADD A FRIEND" color="#3b82f6"/>
          <div style={{ padding: '20px 24px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '16px' }}>
            <form action="/api/friends/send-request" method="POST" style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input name="username" type="text" placeholder="Search by username…" style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px 12px 42px', color: 'white', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '15px', outline: 'none' }}/>
              </div>
              <button type="submit" style={{ padding: '12px 24px', background: '#3b82f6', border: 'none', borderRadius: '12px', color: 'white', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '14px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 4px 16px rgba(59,130,246,0.3)', whiteSpace: 'nowrap' }}>
                SEND REQUEST
              </button>
            </form>
          </div>
        </div>

        {/* INCOMING REQUESTS */}
        {incoming.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <SectionLabel label={`PENDING REQUESTS · ${incoming.length}`} color="#f97316"/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {incoming.map((f: any) => {
                const friend = getFriend(f)
                return (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '14px' }}>
                    <Avatar name={friend?.username} color="#f97316"/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '17px', color: 'white', lineHeight: 1 }}>{friend?.display_name ?? friend?.username}</div>
                      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>@{friend?.username} · Level {friend?.level ?? 1}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <form action="/api/friends/accept" method="POST">
                        <input type="hidden" name="friendshipId" value={f.id}/>
                        <button type="submit" style={{ padding: '9px 18px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '10px', color: '#22c55e', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>ACCEPT</button>
                      </form>
                      <form action="/api/friends/decline" method="POST">
                        <input type="hidden" name="friendshipId" value={f.id}/>
                        <button type="submit" style={{ padding: '9px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#ef4444', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>DECLINE</button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* FRIENDS LIST */}
        <div style={{ marginBottom: '28px' }}>
          <SectionLabel label="YOUR ROSTER" color="#22c55e"/>
          {accepted.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {accepted.map((f: any) => {
                const friend = getFriend(f)
                return (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' }}>
                    <Avatar name={friend?.username} color="#22c55e"/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '17px', color: 'white', lineHeight: 1 }}>{friend?.display_name ?? friend?.username}</div>
                      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>@{friend?.username} · Level {friend?.level ?? 1}</div>
                    </div>
                    <a href={`/profile/${friend?.username}`} style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px', letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none' }}>
                      PROFILE
                    </a>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ padding: '56px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ opacity: 0.3, marginBottom: '16px' }}>
                <circle cx="24" cy="22" r="10" stroke="white" strokeWidth="1.5"/>
                <path d="M8 56c0-9 7-16 16-16s16 7 16 16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="48" cy="22" r="10" stroke="white" strokeWidth="1.5"/>
                <path d="M32 56c0-9 7-16 16-16s16 7 16 16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="36" cy="38" r="9" fill="#05080f" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
                <path d="M36 32v12M30 38h12" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '22px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '8px' }}>NO TEAMMATES YET</div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '14px', color: 'rgba(255,255,255,0.25)' }}>Search for players above and send a request.</div>
            </div>
          )}
        </div>

        {/* PENDING SENT */}
        {outgoing.length > 0 && (
          <div>
            <SectionLabel label="REQUESTS SENT" color="rgba(255,255,255,0.3)"/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {outgoing.map((f: any) => {
                const friend = getFriend(f)
                return (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', opacity: 0.55 }}>
                    <Avatar name={friend?.username} color="rgba(255,255,255,0.3)" size={36}/>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>@{friend?.username}</div>
                    <div style={{ marginLeft: 'auto', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>PENDING</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Avatar({ name, color, size = 44 }: { name?: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '12px', background: `${color}18`, border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: size * 0.4, color, flexShrink: 0 }}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: '12px 18px', background: `${color}0d`, border: `1px solid ${color}25`, borderRadius: '12px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '28px', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: `${color}80` }}>{label}</div>
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
