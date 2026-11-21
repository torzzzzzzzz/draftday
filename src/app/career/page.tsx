import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Zap, ChevronRight, Star, Flag } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Career' }

const STAGE_INFO = {
  high_school: { label: 'High School', icon: '🏫', color: 'brand', next: 'Get recruited to college' },
  college:     { label: 'College',     icon: '🎓', color: 'blue',  next: 'Enter the NFL Draft' },
  nfl:         { label: 'NFL',         icon: '🏈', color: 'amber', next: 'Win Super Bowls & reach HOF' },
  retired:     { label: 'Retired',     icon: '🏛️', color: 'purple', next: 'Legacy complete' },
}

export default async function CareerPage({
  searchParams,
}: { searchParams: { new?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: careersRaw } = await supabase
    .from('careers')
    .select(`*, players(*)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  const careers = careersRaw as any[] | null

  if (!careers || careers.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="card p-12">
          <div className="text-6xl mb-4">🏈</div>
          <h1 className="font-display text-4xl font-800 text-white mb-3">No Career Yet</h1>
          <p className="text-gray-400 mb-8">Create your first player to start your football journey.</p>
          <Link href="/create-player" className="btn btn-primary text-lg px-8 py-4">
            Create Your Player
          </Link>
        </div>
      </div>
    )
  }

  const activeCareers = careers.filter(c => c.is_active)
  const retiredCareers = careers.filter(c => !c.is_active)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-5xl font-800 text-white">MY CAREER</h1>
          <p className="text-gray-400 mt-1">Your football journey from high school to the Hall of Fame</p>
        </div>
        <Link href="/create-player" className="btn btn-secondary">
          + New Player
        </Link>
      </div>

      {searchParams.new === 'true' && (
        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400">
          🎉 Welcome to your career! Start by playing your first game.
        </div>
      )}

      {/* Active careers */}
      {activeCareers.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="font-display font-700 text-xl text-white">Active Careers</h2>
          {activeCareers.map(career => {
            const player = career.players as any
            if (!player) return null
            const stage = STAGE_INFO[career.stage as keyof typeof STAGE_INFO]

            return (
              <Link key={career.id} href={`/career/${career.id}`}>
                <div className="card card-hover p-5">
                  <div className="flex items-center gap-4">
                    {/* Mini player card */}
                    <div
                      className="w-16 h-20 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{ background: `${player.primary_color}22`, borderColor: `${player.primary_color}44` }}
                    >
                      <div className="text-center">
                        <div className="text-xl font-display font-900" style={{ color: player.primary_color }}>
                          #{player.jersey_number}
                        </div>
                        <div className="text-xs font-display font-700 text-gray-400">{player.position}</div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{stage.icon}</span>
                        <span className="text-gray-400 text-sm">{stage.label} · Year {career.current_year}</span>
                        {career.nfl_team && (
                          <span className="text-xs bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 text-amber-400">
                            {career.nfl_team}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-800 text-2xl text-white">{player.name}</h3>
                      {player.nickname && <p className="text-gray-500 text-sm">"{player.nickname}"</p>}

                      {/* Accolades */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {career.super_bowl_wins > 0 && (
                          <span className="text-xs text-amber-400">🏆 {career.super_bowl_wins}× Super Bowl</span>
                        )}
                        {career.mvp_awards > 0 && (
                          <span className="text-xs text-blue-400">⭐ {career.mvp_awards}× MVP</span>
                        )}
                        {career.hall_of_fame && (
                          <span className="text-xs text-purple-400">🏛 HOF</span>
                        )}
                      </div>
                    </div>

                    {/* Overall & progress */}
                    <div className="text-right shrink-0">
                      <div className="text-4xl font-display font-900"
                        style={{ color: player.overall >= 85 ? '#25a56e' : player.overall >= 75 ? '#fbbf24' : '#f97316' }}>
                        {player.overall}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">Overall</div>
                      <ChevronRight size={16} className="text-gray-500 ml-auto mt-2" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Career Goal: {stage.next}</span>
                      <span className="text-xs text-gray-500">Rep: {career.reputation_score}/100</span>
                    </div>
                    <div className="stat-bar">
                      <div
                        className="stat-bar-fill"
                        style={{ width: `${career.reputation_score}%`, background: 'linear-gradient(90deg, #25a56e, #48c18a)' }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Retired careers */}
      {retiredCareers.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-700 text-xl text-white">Retired Careers</h2>
          {retiredCareers.map(career => {
            const player = career.players as any
            if (!player) return null
            return (
              <Link key={career.id} href={`/career/${career.id}`}>
                <div className="card card-hover p-4 opacity-70 hover:opacity-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-white/5">🏛️</div>
                    <div className="flex-1">
                      <span className="font-medium text-white">{player.name}</span>
                      <span className="text-gray-500 text-sm ml-2">· {player.position} · OVR {player.overall}</span>
                    </div>
                    {career.super_bowl_wins > 0 && (
                      <span className="text-amber-400 text-sm">🏆 ×{career.super_bowl_wins}</span>
                    )}
                    <ChevronRight size={14} className="text-gray-600" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
