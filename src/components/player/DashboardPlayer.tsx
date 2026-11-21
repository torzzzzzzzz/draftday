'use client'

import Link from 'next/link'
import { ChevronRight, Trophy, TrendingUp } from 'lucide-react'

function getOverallColor(ovr: number) {
  if (ovr >= 85) return '#25a56e'
  if (ovr >= 75) return '#fbbf24'
  if (ovr >= 65) return '#f97316'
  return '#ef4444'
}

const STAGE_LABELS: Record<string, string> = {
  high_school: '🏫 High School',
  college: '🎓 College',
  nfl: '🏈 NFL',
  retired: '🏆 Retired',
}

export function DashboardPlayer({ player, career }: { player: any; career: any }) {
  const ovrColor = getOverallColor(player.overall)
  const stageLabel = STAGE_LABELS[career.stage] || career.stage

  return (
    <div className="card overflow-hidden">
      <div
        className="relative p-5"
        style={{
          background: `linear-gradient(135deg, ${player.primary_color}22, rgba(10,14,12,0.9))`
        }}
      >
        <div className="flex items-center gap-4">
          {/* Mini avatar */}
          <div
            className="w-20 h-24 rounded-xl flex items-center justify-center shrink-0 border-2"
            style={{ background: `${player.primary_color}22`, borderColor: `${player.primary_color}44` }}
          >
            <svg viewBox="0 0 60 90" width="60" height="90">
              <path
                d="M15,30 L10,40 L8,70 L25,70 L25,50 L35,50 L35,70 L52,70 L50,40 L45,30 L38,25 L30,27 L22,25 Z"
                fill={player.primary_color}
                stroke={player.secondary_color}
                strokeWidth="1.5"
              />
              <rect x="26" y="20" width="8" height="12" rx="2" fill="#b8743a" />
              <ellipse cx="30" cy="14" rx="11" ry="12" fill="#b8743a" />
              <path
                d="M18,16 Q18,4 30,4 Q42,4 42,16 L42,22 L40,22 L40,18 Q40,8 30,8 Q20,8 20,18 L20,22 L18,22 Z"
                fill={player.primary_color}
              />
              <text x="30" y="45" textAnchor="middle" fill={player.secondary_color} fontSize="10" fontWeight="800">
                {player.jersey_number}
              </text>
            </svg>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2 py-0.5 rounded text-xs font-display font-800"
                style={{ background: `${player.primary_color}33`, color: player.primary_color }}
              >
                {player.position}
              </span>
              <span className="text-xs text-gray-500">{stageLabel}</span>
            </div>
            <h2 className="font-display font-800 text-2xl text-white leading-none">{player.name}</h2>
            {player.nickname && (
              <p className="text-gray-400 text-sm mt-0.5">"{player.nickname}"</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <div>
                <div
                  className="text-3xl font-display font-900"
                  style={{ color: ovrColor }}
                >
                  {player.overall}
                </div>
                <div className="text-xs text-gray-500">Overall</div>
              </div>
              <div>
                <div className="text-xl font-display font-700 text-white">Year {career.current_year}</div>
                <div className="text-xs text-gray-500">Season {career.season}</div>
              </div>
              {career.super_bowl_wins > 0 && (
                <div className="text-center">
                  <div className="text-xl font-display font-700 text-amber-400">
                    {'🏆'.repeat(Math.min(career.super_bowl_wins, 5))}
                  </div>
                  <div className="text-xs text-gray-500">Championships</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accolades bar */}
        {(career.mvp_awards > 0 || career.pro_bowl_selections > 0 || career.all_pro_selections > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {career.mvp_awards > 0 && (
              <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400">
                {career.mvp_awards}× MVP
              </span>
            )}
            {career.pro_bowl_selections > 0 && (
              <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400">
                {career.pro_bowl_selections}× Pro Bowl
              </span>
            )}
            {career.all_pro_selections > 0 && (
              <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-400">
                {career.all_pro_selections}× All-Pro
              </span>
            )}
            {career.hall_of_fame && (
              <span className="px-2 py-1 bg-gold-500/10 border border-gold-500/20 rounded-full text-xs text-amber-400">
                🏛 Hall of Fame
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex border-t border-white/5">
        <Link
          href="/career"
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-gray-400 hover:text-orange-400 hover:bg-orange-500/5 transition-all"
        >
          <Trophy size={15} />
          Career
          <ChevronRight size={14} />
        </Link>
        <div className="w-px bg-white/5" />
        <Link
          href="/play"
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-orange-400 hover:bg-orange-500/10 transition-all font-medium"
        >
          <TrendingUp size={15} />
          Play Game
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}
