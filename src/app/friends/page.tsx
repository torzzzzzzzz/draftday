import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Friends' }

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

function AddPersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function EmptyFriendsArt() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Two player silhouettes */}
      <circle cx="28" cy="22" r="10" fill="#374151"/>
      <path d="M10 56c0-9.94 8.06-18 18-18s18 8.06 18 18" fill="#374151"/>
      <circle cx="52" cy="22" r="10" fill="#4B5563"/>
      <path d="M34 56c0-9.94 8.06-18 18-18s18 8.06 18 18" fill="#4B5563"/>
      {/* Plus connecting them */}
      <circle cx="40" cy="40" r="10" fill="#1a1a2e" stroke="#374151" strokeWidth="1.5"/>
      <line x1="40" y1="34" x2="40" y2="46" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
      <line x1="34" y1="40" x2="46" y2="40" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

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
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-5xl font-800 text-white">FRIENDS</h1>
          <p className="text-gray-400 mt-1">Connect with other players</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '8px 16px',
          color: '#9CA3AF',
          fontSize: '14px',
        }}>
          <UsersIcon />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{accepted.length}</span>
          <span>friends</span>
        </div>
      </div>

      {/* Add Friend Card */}
      <div className="card p-5 mb-6" style={{ borderColor: 'rgba(249,115,22,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ color: 'var(--accent-orange)' }}><AddPersonIcon /></div>
          <h2 className="font-display font-700 text-white" style={{ fontSize: '16px', letterSpacing: '0.05em' }}>ADD FRIEND</h2>
        </div>
        <form action="/api/friends/send-request" method="POST" style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}>
              <SearchIcon />
            </span>
            <input
              name="username"
              type="text"
              placeholder="Search by username…"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '10px 16px 10px 38px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
            Send Request
          </button>
        </form>
      </div>

      {/* Incoming Requests */}
      {incoming.length > 0 && (
        <div className="mb-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <h2 className="font-display font-700 text-white" style={{ fontSize: '20px' }}>FRIEND REQUESTS</h2>
            <span style={{
              background: 'var(--accent-orange)',
              color: 'white',
              borderRadius: '999px',
              padding: '2px 10px',
              fontSize: '12px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
            }}>{incoming.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {incoming.map(f => {
              const friend = getFriend(f)
              return (
                <div key={f.id} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', color: 'var(--accent-orange)',
                  }}>
                    {friend?.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>{friend?.display_name ?? friend?.username}</div>
                    <div style={{ color: '#6B7280', fontSize: '12px' }}>@{friend?.username} · Level {friend?.level ?? 1}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <form action="/api/friends/accept" method="POST">
                      <input type="hidden" name="friendshipId" value={f.id} />
                      <button type="submit" style={{
                        background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
                        color: '#10B981', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600,
                      }}>
                        <CheckIcon /> Accept
                      </button>
                    </form>
                    <form action="/api/friends/decline" method="POST">
                      <input type="hidden" name="friendshipId" value={f.id} />
                      <button type="submit" style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        color: '#EF4444', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600,
                      }}>
                        <XIcon /> Decline
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="mb-6">
        <h2 className="font-display font-700 text-white mb-3" style={{ fontSize: '20px' }}>YOUR FRIENDS</h2>
        {accepted.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {accepted.map(f => {
              const friend = getFriend(f)
              const initials = friend?.username?.[0]?.toUpperCase() ?? '?'
              return (
                <div key={f.id} className="card card-hover" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', color: 'var(--accent-orange)',
                  }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>{friend?.display_name ?? friend?.username}</div>
                    <div style={{ color: '#6B7280', fontSize: '12px' }}>@{friend?.username} · Level {friend?.level ?? 1}</div>
                  </div>
                  <a href={`/profile/${friend?.username}`} style={{
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#D1D5DB', borderRadius: '10px', padding: '7px 16px',
                    fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                    fontFamily: 'var(--font-display)',
                  }}>
                    VIEW
                  </a>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <EmptyFriendsArt />
            <h3 className="font-display font-700 text-white" style={{ fontSize: '20px', margin: '16px 0 8px' }}>NO FRIENDS YET</h3>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>Search for players by username to send friend requests.</p>
          </div>
        )}
      </div>

      {/* Pending Sent */}
      {outgoing.length > 0 && (
        <div>
          <h2 className="font-display font-700 mb-3" style={{ fontSize: '20px', color: '#6B7280' }}>PENDING SENT</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {outgoing.map(f => {
              const friend = getFriend(f)
              return (
                <div key={f.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '15px', color: '#6B7280',
                  }}>
                    {friend?.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div style={{ flex: 1, fontSize: '14px' }}>
                    <span style={{ color: '#9CA3AF' }}>@{friend?.username}</span>
                    <span style={{ color: '#4B5563', marginLeft: '8px' }}>· request pending</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
