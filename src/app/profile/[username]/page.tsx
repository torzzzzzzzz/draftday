import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Trophy, Star, Calendar, Shield } from 'lucide-react'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  return { title: `@${params.username} · Draft Day` }
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profileRaw) notFound()
  const profile = profileRaw as any

  const isOwnProfile = currentUser?.id === profile.id

  // Fetch their active players
  const { data: playersRaw } = await supabase
    .from('players')
    .select(`*, careers(*)`)
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .limit(6)
  const players = playersRaw as any[] | null

  // Fetch HOF entries
  const { data: hofEntriesRaw } = await supabase
    .from('hall_of_fame')
    .select('*')
    .eq('user_id', profile.id)
    .order('inducted_at', { ascending: false })
  const hofEntries = hofEntriesRaw as any[] | null

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-orange-500/20 border-2 border-orange-500/30 flex items-center justify-center text-4xl font-display font-900 text-orange-400 shrink-0">
            {profile.username[0].toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-3xl font-800 text-white">
                {profile.display_name ?? profile.username}
              </h1>
              {isOwnProfile && (
                <a href="/settings" className="text-xs text-gray-500 hover:text-gray-300 border border-white/10 rounded-lg px-2 py-1">
                  Edit Profile
                </a>
              )}
            </div>
            <div className="text-gray-400 text-sm">@{profile.username}</div>

            {profile.bio && (
              <p className="text-gray-300 text-sm mt-2">{profile.bio}</p>
            )}

            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                Joined {joinDate}
              </span>
              <span className="flex items-center gap-1">
                <Shield size={12} />
                Level {profile.level}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="text-center">
              <div className="text-2xl font-display font-900 text-amber-400">{hofEntries?.length ?? 0}</div>
              <div className="text-xs text-gray-500">HOF</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-display font-900 text-orange-400">{profile.level}</div>
              <div className="text-xs text-gray-500">Level</div>
            </div>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-gray-400">Level {profile.level}</span>
          <span className="text-gray-400">{profile.xp?.toLocaleString()} XP</span>
        </div>
        <div className="xp-bar">
          <div
            className="xp-bar-fill"
            style={{ width: `${Math.min(100, ((profile.xp ?? 0) % (profile.level * 1000)) / (profile.level * 10))}%` }}
          />
        </div>
      </div>

      {/* Active Players */}
      {players && players.length > 0 && (
        <div className="mb-6">
          <h2 className="font-display font-700 text-xl text-white mb-3">Active Players</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {players.map((player) => {
              const career = (player.careers as any)?.[0]
              return (
                <div key={player.id} className="card p-4">
                  <div
                    className="w-full aspect-square rounded-xl flex items-center justify-center text-5xl mb-3"
                    style={{ background: `${player.primary_color}22` }}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-display font-900" style={{ color: player.primary_color }}>
                        #{player.jersey_number}
                      </div>
                      <div className="text-xs text-gray-400 font-display">{player.position}</div>
                    </div>
                  </div>
                  <div className="text-white font-display font-700 text-sm">{player.name}</div>
                  {player.nickname && <div className="text-xs text-gray-500">"{player.nickname}"</div>}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500 capitalize">{career?.stage?.replace('_', ' ') ?? 'HS'}</span>
                    <span
                      className="font-display font-900 text-lg"
                      style={{ color: player.overall >= 85 ? '#25a56e' : player.overall >= 75 ? '#fbbf24' : '#f97316' }}
                    >
                      {player.overall}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Hall of Fame */}
      {hofEntries && hofEntries.length > 0 && (
        <div>
          <h2 className="font-display font-700 text-xl text-white mb-3">Hall of Fame</h2>
          <div className="space-y-3">
            {hofEntries.map((entry) => (
              <div key={entry.id} className="card p-4 flex items-center gap-3 border-purple-500/20">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">🏛️</div>
                <div className="flex-1">
                  <div className="text-white font-medium">{entry.player_name}</div>
                  <div className="text-xs text-gray-500">
                    {entry.position} · {entry.super_bowl_wins} Super Bowl{entry.super_bowl_wins !== 1 ? 's' : ''}
                    {' · '} Inducted {new Date(entry.inducted_at).getFullYear()}
                  </div>
                </div>
                <div className="font-display font-900 text-xl text-purple-400">{entry.overall_rating}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
