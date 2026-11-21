'use client'

import Link from 'next/link'
import { Trophy, TrendingUp, Star } from 'lucide-react'

interface CareerOfTheWeekProps {
  preview?: boolean
}

// Static placeholder — will be populated from DB in production
const MOCK_TOP = [
  { rank: 1, name: 'TyroneMVP', playerName: 'Marcus "The Cannon" Webb', position: 'QB', overall: 94, superBowls: 3, userId: 'mock1' },
  { rank: 2, name: 'GridironKing', playerName: 'D\'Andre Swift Jr.', position: 'RB', overall: 91, superBowls: 2, userId: 'mock2' },
  { rank: 3, name: 'PocketRocket', playerName: 'Jake "Laser" Hendricks', position: 'QB', overall: 89, superBowls: 1, userId: 'mock3' },
]

export function CareerOfTheWeek({ preview = false }: CareerOfTheWeekProps) {
  if (preview) {
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <h3 className="font-display font-700 text-lg text-white">Career of the Week</h3>
          </div>
          <Link href="/leaderboards" className="text-xs text-orange-400 hover:text-orange-300">
            View all →
          </Link>
        </div>

        <div className="space-y-3">
          {MOCK_TOP.map((entry) => (
            <div key={entry.rank} className="flex items-center gap-3">
              {/* Rank */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-800 shrink-0 ${
                entry.rank === 1 ? 'bg-amber-500 text-black' :
                entry.rank === 2 ? 'bg-gray-400 text-black' :
                'bg-amber-700 text-white'
              }`}>
                {entry.rank}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-sm font-medium truncate">{entry.playerName}</span>
                  <span className="text-xs text-gray-500 shrink-0">{entry.position}</span>
                </div>
                <div className="text-xs text-gray-500">@{entry.name}</div>
              </div>

              {/* Stats */}
              <div className="text-right shrink-0">
                <div className="text-sm font-display font-800 text-orange-400">{entry.overall}</div>
                <div className="text-xs text-amber-400">🏆 ×{entry.superBowls}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Full leaderboard view
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Trophy size={20} className="text-amber-400" />
        </div>
        <div>
          <h2 className="font-display font-800 text-2xl text-white">Career of the Week</h2>
          <p className="text-gray-400 text-sm">Top careers ranked by overall rating & achievements</p>
        </div>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 mb-8 h-32">
        {/* 2nd */}
        <div className="flex-1 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-500/20 border-2 border-gray-400 flex items-center justify-center mx-auto mb-2 text-lg">🥈</div>
          <div className="bg-gray-400/10 border border-gray-400/20 rounded-t-lg h-20 flex flex-col items-center justify-end pb-2">
            <div className="text-xs text-gray-300 font-medium">{MOCK_TOP[1]?.name}</div>
            <div className="text-xs text-gray-500">{MOCK_TOP[1]?.position} · {MOCK_TOP[1]?.overall}</div>
          </div>
        </div>

        {/* 1st */}
        <div className="flex-1 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto mb-2 text-xl">👑</div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-t-lg h-28 flex flex-col items-center justify-end pb-2">
            <div className="text-sm text-amber-300 font-bold">{MOCK_TOP[0]?.name}</div>
            <div className="text-xs text-amber-500/80">{MOCK_TOP[0]?.position} · {MOCK_TOP[0]?.overall}</div>
          </div>
        </div>

        {/* 3rd */}
        <div className="flex-1 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-800/20 border-2 border-amber-700 flex items-center justify-center mx-auto mb-2 text-lg">🥉</div>
          <div className="bg-amber-800/10 border border-amber-800/20 rounded-t-lg h-14 flex flex-col items-center justify-end pb-2">
            <div className="text-xs text-amber-700 font-medium">{MOCK_TOP[2]?.name}</div>
            <div className="text-xs text-gray-600">{MOCK_TOP[2]?.position} · {MOCK_TOP[2]?.overall}</div>
          </div>
        </div>
      </div>

      {/* Full list */}
      <div className="space-y-2">
        {MOCK_TOP.map((entry) => (
          <div key={entry.rank} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-display font-900 shrink-0 ${
              entry.rank === 1 ? 'bg-amber-500 text-black' :
              entry.rank === 2 ? 'bg-gray-400 text-black' :
              'bg-amber-700 text-white'
            }`}>
              {entry.rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{entry.playerName}</span>
                <span className="text-xs bg-orange-500/10 text-orange-400 rounded px-1.5 py-0.5">{entry.position}</span>
              </div>
              <div className="text-xs text-gray-500">by @{entry.name} · {entry.superBowls} Super Bowl{entry.superBowls !== 1 ? 's' : ''}</div>
            </div>
            <div className="text-right">
              <div className="font-display font-900 text-xl"
                style={{ color: entry.overall >= 90 ? '#25a56e' : entry.overall >= 80 ? '#fbbf24' : '#f97316' }}>
                {entry.overall}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
