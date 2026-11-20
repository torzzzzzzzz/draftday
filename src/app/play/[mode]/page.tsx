'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Zap, ChevronRight, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface GameResult {
  won: boolean
  score: { player: number; opponent: number }
  stats: Record<string, number>
  storyEvent?: { title: string; description: string; choices?: { text: string; outcome: string }[] }
  xpEarned: number
  coinsEarned: number
}

function simulateGame(position: string, overall: number, mode: string): GameResult {
  const winChance = 0.3 + (overall - 50) / 100
  const won = Math.random() < winChance

  const playerScore = won
    ? 17 + Math.floor(Math.random() * 24)
    : 7 + Math.floor(Math.random() * 17)
  const opponentScore = won
    ? Math.max(0, playerScore - 3 - Math.floor(Math.random() * 14))
    : playerScore + 3 + Math.floor(Math.random() * 14)

  // Position-specific stats
  const stats: Record<string, number> = {}
  switch (position) {
    case 'QB':
      stats['Completions'] = 15 + Math.floor(Math.random() * 15)
      stats['Attempts'] = stats['Completions'] + 3 + Math.floor(Math.random() * 8)
      stats['Pass Yards'] = 150 + Math.floor(Math.random() * 250)
      stats['TD Passes'] = won ? 1 + Math.floor(Math.random() * 4) : Math.floor(Math.random() * 3)
      stats['INTs'] = won ? 0 : Math.floor(Math.random() * 3)
      break
    case 'RB':
      stats['Carries'] = 10 + Math.floor(Math.random() * 15)
      stats['Rush Yards'] = 50 + Math.floor(Math.random() * 150)
      stats['Rush TDs'] = won ? Math.floor(Math.random() * 3) : 0
      stats['Receptions'] = Math.floor(Math.random() * 6)
      break
    case 'WR':
    case 'TE':
      stats['Targets'] = 5 + Math.floor(Math.random() * 10)
      stats['Receptions'] = Math.floor(stats['Targets'] * 0.6)
      stats['Rec Yards'] = 30 + Math.floor(Math.random() * 120)
      stats['Rec TDs'] = won ? Math.floor(Math.random() * 2) : 0
      break
    default:
      stats['Tackles'] = 3 + Math.floor(Math.random() * 10)
      stats['Sacks'] = Math.floor(Math.random() * 3)
      stats['PBUs'] = Math.floor(Math.random() * 3)
  }

  const xpEarned = won ? 100 + Math.floor(Math.random() * 100) : 25 + Math.floor(Math.random() * 50)
  const coinsEarned = won ? 50 + Math.floor(Math.random() * 100) : 10 + Math.floor(Math.random() * 25)

  return { won, score: { player: playerScore, opponent: opponentScore }, stats, xpEarned, coinsEarned }
}

export default function GamePage({ params }: { params: { mode: string } }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const careerId = searchParams.get('career')
  const supabase = createClient()

  const [phase, setPhase] = useState<'loading' | 'pregame' | 'simulating' | 'result'>('loading')
  const [career, setCareer] = useState<any>(null)
  const [result, setResult] = useState<GameResult | null>(null)
  const [simProgress, setSimProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!careerId) { router.push('/play'); return }
    supabase
      .from('careers')
      .select(`*, players(*)`)
      .eq('id', careerId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setError('Career not found'); return }
        setCareer(data)
        setPhase('pregame')
      })
  }, [careerId])

  const startGame = () => {
    setPhase('simulating')
    setSimProgress(0)
    const interval = setInterval(() => {
      setSimProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          const player = career.players
          const game = simulateGame(player.position, player.overall, params.mode)
          setResult(game)
          // Save to DB
          ;(supabase as any).from('game_results').insert({
            career_id: career.id,
            user_id: career.user_id,
            stats: game.stats,
            won: game.won,
            score_for: game.score.player,
            score_against: game.score.opponent,
            gameplay_mode: params.mode,
          }).then(() => {
            // Award XP and coins via RPC
            ;(supabase as any).rpc('award_xp', { p_user_id: career.user_id, p_amount: game.xpEarned, p_source: 'game' })
            ;(supabase as any).rpc('award_coins', { p_user_id: career.user_id, p_amount: game.coinsEarned, p_source: 'game' })
            setPhase('result')
          })
          return 100
        }
        return p + Math.random() * 8 + 2
      })
    }, 100)
  }

  if (phase === 'loading' || !career) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your game…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card p-8">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/play" className="btn btn-secondary">Back to Play</Link>
        </div>
      </div>
    )
  }

  const player = career.players

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/play" className="btn btn-ghost p-2">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="text-xs text-gray-500 capitalize">{params.mode} Mode</div>
          <h1 className="font-display text-2xl font-800 text-white">{player.name}</h1>
        </div>
      </div>

      {/* PRE-GAME */}
      {phase === 'pregame' && (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">🏈</div>
          <h2 className="font-display text-3xl font-800 text-white mb-2">Ready to Play?</h2>
          <p className="text-gray-400 mb-2">
            {career.stage === 'high_school' ? 'High School game' :
             career.stage === 'college' ? 'College game' :
             'NFL game'} · Year {career.current_year}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {params.mode === 'simple'
              ? 'Sit back and watch the simulation unfold.'
              : params.mode === 'advanced'
              ? 'Your decisions will shape the outcome.'
              : 'Experience the story of this game.'}
          </p>
          <button onClick={startGame} className="btn btn-primary text-xl px-12 py-5">
            Kick Off! 🏈
          </button>
        </div>
      )}

      {/* SIMULATING */}
      {phase === 'simulating' && (
        <div className="card p-8 text-center">
          <div className="text-5xl mb-6 animate-bounce">🏈</div>
          <h2 className="font-display text-3xl font-800 text-white mb-2">Game in Progress</h2>
          <p className="text-gray-400 mb-6">
            {simProgress < 25 ? '1st Quarter' :
             simProgress < 50 ? '2nd Quarter' :
             simProgress < 75 ? '3rd Quarter' : '4th Quarter'}
          </p>
          <div className="stat-bar h-4 rounded-full mb-2">
            <div
              className="stat-bar-fill rounded-full transition-all duration-200"
              style={{
                width: `${simProgress}%`,
                background: 'linear-gradient(90deg, #25a56e, #48c18a)',
              }}
            />
          </div>
          <p className="text-xs text-gray-600">{Math.round(simProgress)}%</p>
        </div>
      )}

      {/* RESULT */}
      {phase === 'result' && result && (
        <div className="space-y-4">
          {/* Scoreboard */}
          <div className={`card p-6 text-center ${result.won ? 'border-brand-500/30' : 'border-red-500/20'}`}>
            <div className="text-5xl mb-2">{result.won ? '🏆' : '💪'}</div>
            <div className={`font-display text-4xl font-900 mb-1 ${result.won ? 'text-brand-400' : 'text-red-400'}`}>
              {result.won ? 'VICTORY!' : 'LOSS'}
            </div>
            <div className="font-display text-6xl font-900 text-white my-4">
              {result.score.player} – {result.score.opponent}
            </div>
          </div>

          {/* Stats */}
          <div className="card p-5">
            <h3 className="font-display font-700 text-lg text-white mb-4">Game Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(result.stats).map(([key, val]) => (
                <div key={key} className="bg-white/3 rounded-xl p-3 text-center">
                  <div className="font-display font-900 text-2xl text-white">{val}</div>
                  <div className="text-xs text-gray-500">{key}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards */}
          <div className="card p-5">
            <h3 className="font-display font-700 text-lg text-white mb-3">Rewards Earned</h3>
            <div className="flex gap-4">
              <div className="flex-1 bg-brand-500/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-display font-900 text-brand-400">+{result.xpEarned}</div>
                <div className="text-xs text-gray-500">XP</div>
              </div>
              <div className="flex-1 bg-amber-500/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-display font-900 text-amber-400">+{result.coinsEarned}</div>
                <div className="text-xs text-gray-500">Coins</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { setPhase('pregame'); setResult(null); setSimProgress(0) }}
              className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Play Again
            </button>
            <Link href={`/career/${careerId}`} className="btn btn-primary flex-1 text-center">
              View Career
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
