import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Zap, Trophy, ChevronRight, Info } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Play' }

const GAMEPLAY_MODES = [
  {
    id: 'simple',
    icon: '🎮',
    title: 'Simple Mode',
    subtitle: 'Sit back and watch',
    description: 'Your player\'s stats automatically determine the outcome. Enjoy the story and watch your stats grow.',
    features: ['Automated gameplay', 'Focus on story decisions', 'Great for beginners'],
    color: '#25a56e',
  },
  {
    id: 'advanced',
    icon: '🏈',
    title: 'Advanced Mode',
    subtitle: 'Take control of the action',
    description: 'Make real-time play calls and decisions. Your choices on the field directly affect the outcome.',
    features: ['Play calling', 'Skill checks', 'Greater rewards for wins'],
    color: '#f59e0b',
  },
  {
    id: 'story',
    icon: '📖',
    title: 'Story Mode',
    subtitle: 'Pure narrative experience',
    description: 'Focus entirely on the career story events, locker room moments, and pivotal decisions.',
    features: ['Story events only', 'Maximum narrative depth', 'No game simulation'],
    color: '#a855f7',
  },
]

export default async function PlayPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get active careers
  const { data: careersRaw } = await supabase
    .from('careers')
    .select(`*, players(name, position, overall, primary_color, jersey_number, nickname)`)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
  const careers = careersRaw as any[] | null

  if (!careers || careers.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="card p-12">
          <div className="text-6xl mb-4">🏈</div>
          <h1 className="font-display text-4xl font-800 text-white mb-3">No Active Career</h1>
          <p className="text-gray-400 mb-8">Create a player and start your career to play games.</p>
          <Link href="/create-player" className="btn btn-primary text-lg px-8 py-4">Create Your Player</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-5xl font-800 text-white">PLAY</h1>
        <p className="text-gray-400 mt-1">Choose your player and game mode</p>
      </div>

      {/* Player selector */}
      {careers.length > 1 && (
        <div className="card p-5 mb-6">
          <h2 className="font-display font-700 text-lg text-white mb-3">Select Player</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {careers.map((career) => {
              const player = career.players as any
              return (
                <button key={career.id} className="card card-hover p-3 text-left flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-900"
                    style={{ background: `${player.primary_color}22`, color: player.primary_color }}
                  >
                    #{player.jersey_number}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{player.name}</div>
                    <div className="text-xs text-gray-500">{player.position} · OVR {player.overall}</div>
                  </div>
                  <ChevronRight size={14} className="text-gray-500" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Active career info */}
      {careers[0] && (
        <div className="card p-5 mb-6 border-orange-500/20">
          {(() => {
            const career = careers[0]
            const player = career.players as any
            return (
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-18 rounded-xl flex items-center justify-center font-display font-900 text-2xl shrink-0"
                  style={{ background: `${player.primary_color}22`, color: player.primary_color }}
                >
                  #{player.jersey_number}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-orange-400 font-display font-700 uppercase tracking-wide mb-0.5">
                    {career.stage?.replace(/_/g, ' ')} · Year {career.current_year}
                  </div>
                  <div className="font-display font-800 text-2xl text-white">{player.name}</div>
                  {player.nickname && <div className="text-gray-400 text-sm">"{player.nickname}"</div>}
                </div>
                <div className="text-right">
                  <div className="text-4xl font-display font-900"
                    style={{ color: player.overall >= 85 ? '#25a56e' : '#fbbf24' }}>
                    {player.overall}
                  </div>
                  <div className="text-xs text-gray-500">Overall</div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Game modes */}
      <h2 className="font-display font-700 text-xl text-white mb-4">Select Game Mode</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {GAMEPLAY_MODES.map((mode) => (
          <Link
            key={mode.id}
            href={`/play/${mode.id}?career=${careers[0]?.id}`}
            className="card card-hover p-5 group"
            style={{ borderColor: `${mode.color}22` }}
          >
            <div className="text-4xl mb-3">{mode.icon}</div>
            <h3 className="font-display font-800 text-lg text-white mb-0.5">{mode.title}</h3>
            <p className="text-xs font-medium mb-3" style={{ color: mode.color }}>{mode.subtitle}</p>
            <p className="text-sm text-gray-400 mb-4">{mode.description}</p>
            <ul className="space-y-1.5 mb-4">
              {mode.features.map(f => (
                <li key={f} className="text-xs text-gray-500 flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full" style={{ background: mode.color }} />
                  {f}
                </li>
              ))}
            </ul>
            <div
              className="btn text-sm py-2 w-full text-center transition-opacity group-hover:opacity-90"
              style={{ background: `${mode.color}22`, color: mode.color, borderColor: `${mode.color}44` }}
            >
              Select Mode →
            </div>
          </Link>
        ))}
      </div>

      {/* Quick tip */}
      <div className="card p-4 bg-white/2 border-white/5">
        <div className="flex items-start gap-2">
          <Info size={15} className="text-gray-500 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-500">
            Your career automatically progresses through seasons. Win games, complete challenges, and make
            story decisions to build your reputation and earn accolades on your way to the Hall of Fame.
          </p>
        </div>
      </div>
    </div>
  )
}
