import { createClient } from '@/lib/supabase/server'
import { CareerOfTheWeek } from '@/components/leaderboard/CareerOfTheWeek'
import { Trophy, TrendingUp, Star, Users } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Leaderboards' }

export default async function LeaderboardsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch top hall of fame entries
  const { data: hofEntriesRaw } = await supabase
    .from('hall_of_fame')
    .select(`*, profiles(username)`)
    .order('overall_rating', { ascending: false })
    .limit(10)
  const hofEntries = hofEntriesRaw as any[] | null

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-5xl font-800 text-white">LEADERBOARDS</h1>
        <p className="text-gray-400 mt-1">The best careers in Draft Day history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Trophy size={20} className="text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-display font-900 text-white">3</div>
            <div className="text-xs text-gray-500">Super Bowl Winners</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <TrendingUp size={20} className="text-brand-400" />
          </div>
          <div>
            <div className="text-2xl font-display font-900 text-white">94</div>
            <div className="text-xs text-gray-500">Top OVR This Week</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Star size={20} className="text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-display font-900 text-white">1</div>
            <div className="text-xs text-gray-500">Hall of Famers</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CareerOfTheWeek />

        {/* Hall of Fame */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Star size={20} className="text-purple-400" />
            </div>
            <div>
              <h2 className="font-display font-800 text-2xl text-white">Hall of Fame</h2>
              <p className="text-gray-400 text-sm">Legendary careers that made history</p>
            </div>
          </div>

          {hofEntries && hofEntries.length > 0 ? (
            <div className="space-y-3">
              {hofEntries.map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/3">
                  <div className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏛️'}</div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{entry.player_name}</div>
                    <div className="text-xs text-gray-500">
                      {entry.position} · @{(entry.profiles as any)?.username}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-900 text-xl text-purple-400">{entry.overall_rating}</div>
                    <div className="text-xs text-amber-400">🏆 ×{entry.super_bowl_wins}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-3">🏛️</div>
              <p className="text-sm">No Hall of Famers yet.</p>
              <p className="text-xs text-gray-600 mt-1">Win 3+ Super Bowls to be inducted.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
