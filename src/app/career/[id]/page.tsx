import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Zap, Calendar, TrendingUp, ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Career Details' }

const STAGE_ORDER = ['high_school', 'college', 'nfl', 'retired']
const STAGE_LABEL: Record<string, string> = {
  high_school: 'High School',
  college: 'College',
  nfl: 'NFL',
  retired: 'Retired',
}

export default async function CareerDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: careerRaw } = await supabase
    .from('careers')
    .select(`*, players(*)`)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!careerRaw) notFound()
  const career = careerRaw as any

  const { data: recentGamesRaw } = await supabase
    .from('game_results')
    .select('*')
    .eq('career_id', (career as any).id)
    .order('created_at', { ascending: false })
    .limit(5)
  const recentGames = recentGamesRaw as any[] | null

  const player = career.players as any
  const stageIndex = STAGE_ORDER.indexOf(career.stage)

  const wins = recentGames?.filter(g => g.won).length ?? 0
  const losses = (recentGames?.length ?? 0) - wins

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/career" className="btn btn-ghost p-2">
          <ChevronLeft size={18} />
        </Link>
        <div>
          <div className="text-xs text-gray-500">Career Details</div>
          <h1 className="font-display text-3xl font-800 text-white">{player.name}</h1>
        </div>
        <Link href={`/play/simple?career=${career.id}`} className="btn btn-primary ml-auto">
          Play Next Game →
        </Link>
      </div>

      {/* Career stage progress */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          {STAGE_ORDER.map((stage, i) => (
            <div key={stage} className="flex items-center">
              <div className={`flex flex-col items-center ${i <= stageIndex ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg ${
                  i < stageIndex ? 'bg-orange-500 border-orange-500' :
                  i === stageIndex ? 'border-orange-500 bg-orange-500/20' :
                  'border-white/10 bg-white/5'
                }`}>
                  {i < stageIndex ? '✓' :
                   stage === 'high_school' ? '🏫' :
                   stage === 'college' ? '🎓' :
                   stage === 'nfl' ? '🏈' : '🏛️'}
                </div>
                <div className={`text-xs mt-1 font-medium ${i === stageIndex ? 'text-orange-400' : 'text-gray-500'}`}>
                  {STAGE_LABEL[stage]}
                </div>
              </div>
              {i < STAGE_ORDER.length - 1 && (
                <div className={`h-0.5 w-8 sm:w-16 mx-2 ${i < stageIndex ? 'bg-orange-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player card */}
        <div className="space-y-4">
          <div className="card p-5">
            <div
              className="w-full aspect-square rounded-2xl flex items-center justify-center mb-4"
              style={{ background: `${player.primary_color}22` }}
            >
              <div className="text-center">
                <div className="text-7xl font-display font-900" style={{ color: player.primary_color }}>
                  #{player.jersey_number}
                </div>
                <div className="text-sm font-display font-700 text-gray-400">{player.position}</div>
              </div>
            </div>
            <div className="text-center">
              <h2 className="font-display font-800 text-2xl text-white">{player.name}</h2>
              {player.nickname && <p className="text-gray-400 text-sm">"{player.nickname}"</p>}
              <div
                className="text-6xl font-display font-900 my-2"
                style={{ color: player.overall >= 85 ? '#25a56e' : '#fbbf24' }}
              >
                {player.overall}
              </div>
              <div className="text-xs text-gray-500">Overall Rating</div>
            </div>
          </div>

          {/* Accolades */}
          <div className="card p-4">
            <h3 className="font-display font-700 text-sm text-gray-400 uppercase tracking-wider mb-3">Accolades</h3>
            <div className="space-y-2">
              {career.super_bowl_wins > 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-400">
                  <Trophy size={14} /> {career.super_bowl_wins}× Super Bowl Champion
                </div>
              )}
              {career.mvp_awards > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  ⭐ {career.mvp_awards}× MVP Award
                </div>
              )}
              {career.pro_bowl_selections > 0 && (
                <div className="flex items-center gap-2 text-sm text-purple-400">
                  🌟 {career.pro_bowl_selections}× Pro Bowl
                </div>
              )}
              {career.all_pro_selections > 0 && (
                <div className="flex items-center gap-2 text-sm text-orange-400">
                  🏆 {career.all_pro_selections}× All-Pro
                </div>
              )}
              {career.hall_of_fame && (
                <div className="flex items-center gap-2 text-sm text-purple-300">
                  🏛️ Hall of Fame Inductee
                </div>
              )}
              {!career.super_bowl_wins && !career.mvp_awards && !career.pro_bowl_selections && (
                <p className="text-xs text-gray-600">No accolades yet. Keep playing!</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats & games */}
        <div className="lg:col-span-2 space-y-4">
          {/* Season info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-4 text-center">
              <div className="text-2xl font-display font-900 text-white">{career.current_year}</div>
              <div className="text-xs text-gray-500">Year</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-display font-900 text-orange-400">{career.season_wins ?? 0}</div>
              <div className="text-xs text-gray-500">Season Wins</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-display font-900 text-red-400">{career.season_losses ?? 0}</div>
              <div className="text-xs text-gray-500">Season Losses</div>
            </div>
          </div>

          {/* Recent games */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-700 text-lg text-white">Recent Games</h3>
              <span className="text-xs text-gray-500">Last 5</span>
            </div>
            {recentGames && recentGames.length > 0 ? (
              <div className="space-y-2">
                {recentGames.map((game, i) => (
                  <div key={game.id} className={`flex items-center gap-3 p-3 rounded-xl ${game.won ? 'bg-orange-500/5' : 'bg-red-500/5'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-display font-900 ${game.won ? 'bg-orange-500 text-white' : 'bg-red-500/20 text-red-400'}`}>
                      {game.won ? 'W' : 'L'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">
                        {game.score_for} – {game.score_against}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(game.played_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`text-xs font-medium ${game.won ? 'text-orange-400' : 'text-gray-500'}`}>
                      {game.won ? '+XP' : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                No games played yet. <Link href={`/play/simple?career=${career.id}`} className="text-orange-400 hover:text-orange-300">Start playing!</Link>
              </div>
            )}
          </div>

          {/* Reputation */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-700 text-lg text-white">Reputation</h3>
              <span className="font-display font-900 text-xl text-white">{career.reputation_score}/100</span>
            </div>
            <div className="stat-bar h-3 rounded-full">
              <div
                className="stat-bar-fill rounded-full"
                style={{
                  width: `${career.reputation_score}%`,
                  background: career.reputation_score >= 75 ? 'linear-gradient(90deg, #25a56e, #48c18a)' :
                              career.reputation_score >= 50 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
                              'linear-gradient(90deg, #ef4444, #f87171)',
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {career.reputation_score >= 75 ? '🌟 Elite reputation — scouts are watching' :
               career.reputation_score >= 50 ? '📈 Growing reputation' :
               '💪 Building your name — keep winning!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
