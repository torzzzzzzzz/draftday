import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Zap, Calendar, Trophy, CheckCircle, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Challenges' }

export default async function ChallengesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: challengesRaw } = await supabase
    .from('challenges')
    .select(`*, challenge_progress(progress, completed_at)`)
    .eq('is_active', true)
    .order('type')
  const challenges = challengesRaw as any[] | null

  const daily = challenges?.filter((c: any) => c.type === 'daily') ?? []
  const weekly = challenges?.filter((c: any) => c.type === 'weekly') ?? []

  const ChallengeCard = ({ challenge }: { challenge: any }) => {
    const progress = challenge.challenge_progress?.[0]
    const isComplete = !!progress?.completed_at
    const pct = progress ? Math.min(100, Math.round((progress.progress / challenge.requirement_value) * 100)) : 0

    return (
      <div className={`card p-4 ${isComplete ? 'opacity-60' : ''}`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            isComplete ? 'bg-brand-500/20' : 'bg-white/5'
          }`}>
            {isComplete
              ? <CheckCircle size={18} className="text-brand-400" />
              : <Zap size={18} className="text-amber-400" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-white">{challenge.title}</h3>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-amber-400 text-sm font-display font-700">{challenge.coin_reward}</span>
                <span className="text-xs text-gray-500">coins</span>
                {challenge.xp_reward > 0 && (
                  <>
                    <span className="text-gray-600 mx-1">·</span>
                    <span className="text-brand-400 text-sm font-display font-700">{challenge.xp_reward}</span>
                    <span className="text-xs text-gray-500">XP</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">{challenge.description}</p>

            {/* Progress */}
            {!isComplete && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{progress?.progress ?? 0} / {challenge.requirement_value}</span>
                  <span>{pct}%</span>
                </div>
                <div className="stat-bar h-1.5">
                  <div
                    className="stat-bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: pct === 100 ? '#25a56e' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                    }}
                  />
                </div>
              </div>
            )}

            {isComplete && (
              <div className="mt-2 text-xs text-brand-400">✓ Completed!</div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-5xl font-800 text-white">CHALLENGES</h1>
        <p className="text-gray-400 mt-1">Complete challenges to earn coins and XP</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-display font-900 text-amber-400">
            {daily.filter(c => c.challenge_progress?.[0]?.completed_at).length}/{daily.length}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Daily Done</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-display font-900 text-brand-400">
            {weekly.filter(c => c.challenge_progress?.[0]?.completed_at).length}/{weekly.length}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Weekly Done</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-display font-900 text-white">
            {challenges?.reduce((sum, c) => sum + (c.challenge_progress?.[0]?.completed_at ? c.coin_reward : 0), 0) ?? 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Coins Earned</div>
        </div>
      </div>

      {/* Daily */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-amber-400" />
          <h2 className="font-display font-700 text-xl text-white">Daily Challenges</h2>
          <span className="text-xs text-gray-500 ml-auto">Resets at midnight</span>
        </div>
        {daily.length > 0 ? (
          <div className="space-y-3">
            {daily.map(c => <ChallengeCard key={c.id} challenge={c} />)}
          </div>
        ) : (
          <div className="card p-8 text-center text-gray-500">
            <Clock size={24} className="mx-auto mb-2 opacity-30" />
            <p>No daily challenges available. Check back tomorrow!</p>
          </div>
        )}
      </div>

      {/* Weekly */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-brand-400" />
          <h2 className="font-display font-700 text-xl text-white">Weekly Challenges</h2>
          <span className="text-xs text-gray-500 ml-auto">Resets Monday</span>
        </div>
        {weekly.length > 0 ? (
          <div className="space-y-3">
            {weekly.map(c => <ChallengeCard key={c.id} challenge={c} />)}
          </div>
        ) : (
          <div className="card p-8 text-center text-gray-500">
            <Calendar size={24} className="mx-auto mb-2 opacity-30" />
            <p>No weekly challenges right now. Check back on Monday!</p>
          </div>
        )}
      </div>
    </div>
  )
}
