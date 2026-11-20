import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, UserPlus, Search, Check, X, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Friends' }

export default async function FriendsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch friendships where user is involved
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

  const getFriend = (f: any) => {
    return f.requester_id === user.id ? f.addressee : f.requester
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-5xl font-800 text-white">FRIENDS</h1>
          <p className="text-gray-400 mt-1">Connect with other players</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users size={16} />
          <span>{accepted.length} friends</span>
        </div>
      </div>

      {/* Add friend */}
      <div className="card p-5 mb-6">
        <h2 className="font-display font-700 text-lg text-white mb-3">Add Friend</h2>
        <form action="/api/friends/send-request" method="POST" className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              name="username"
              type="text"
              placeholder="Search by username…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <button type="submit" className="btn btn-primary px-4">
            <UserPlus size={16} />
          </button>
        </form>
      </div>

      {/* Incoming requests */}
      {incoming.length > 0 && (
        <div className="mb-6">
          <h2 className="font-display font-700 text-xl text-white mb-3">
            Friend Requests
            <span className="ml-2 text-sm bg-brand-500 text-white rounded-full px-2 py-0.5">{incoming.length}</span>
          </h2>
          <div className="space-y-3">
            {incoming.map(f => {
              const friend = getFriend(f)
              return (
                <div key={f.id} className="card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg font-display font-900 text-white">
                    {friend?.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{friend?.display_name ?? friend?.username}</div>
                    <div className="text-xs text-gray-500">@{friend?.username} · Level {friend?.level}</div>
                  </div>
                  <div className="flex gap-2">
                    <form action="/api/friends/accept" method="POST">
                      <input type="hidden" name="friendshipId" value={f.id} />
                      <button type="submit" className="btn btn-primary p-2">
                        <Check size={16} />
                      </button>
                    </form>
                    <form action="/api/friends/decline" method="POST">
                      <input type="hidden" name="friendshipId" value={f.id} />
                      <button type="submit" className="btn btn-ghost p-2 text-red-400 hover:bg-red-500/10">
                        <X size={16} />
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div className="mb-6">
        <h2 className="font-display font-700 text-xl text-white mb-3">Your Friends</h2>
        {accepted.length > 0 ? (
          <div className="space-y-3">
            {accepted.map(f => {
              const friend = getFriend(f)
              return (
                <div key={f.id} className="card p-4 flex items-center gap-3 card-hover">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-lg font-display font-900 text-brand-400">
                    {friend?.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{friend?.display_name ?? friend?.username}</div>
                    <div className="text-xs text-gray-500">@{friend?.username} · Level {friend?.level ?? 1}</div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/profile/${friend?.username}`} className="btn btn-ghost text-xs px-3 py-1.5">
                      View
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <Users size={32} className="mx-auto mb-3 text-gray-600" />
            <h3 className="font-display font-700 text-lg text-white mb-1">No Friends Yet</h3>
            <p className="text-gray-400 text-sm">Search for players by username to send friend requests.</p>
          </div>
        )}
      </div>

      {/* Outgoing requests */}
      {outgoing.length > 0 && (
        <div>
          <h2 className="font-display font-700 text-xl text-white mb-3 text-gray-500">Pending Sent</h2>
          <div className="space-y-2">
            {outgoing.map(f => {
              const friend = getFriend(f)
              return (
                <div key={f.id} className="card p-3 flex items-center gap-3 opacity-60">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-display font-900 text-gray-400">
                    {friend?.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 text-sm">
                    <span className="text-gray-400">@{friend?.username}</span>
                    <span className="text-gray-600 ml-2">· request pending</span>
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
