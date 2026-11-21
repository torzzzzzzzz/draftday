'use client'

import type { Position } from '@/types/game'

const POSITIONS: { pos: Position; label: string; group: string; desc: string }[] = [
  { pos: 'QB',  label: 'QB',  group: 'Offense', desc: 'Quarterback — Field general, reads defenses, distributes the ball' },
  { pos: 'RB',  label: 'RB',  group: 'Offense', desc: 'Running Back — Power runs, broken tackles, threat out of backfield' },
  { pos: 'WR',  label: 'WR',  group: 'Offense', desc: 'Wide Receiver — Route runner, big plays, contested catches' },
  { pos: 'TE',  label: 'TE',  group: 'Offense', desc: 'Tight End — Physical receiver, blocker, red zone threat' },
  { pos: 'OL',  label: 'OL',  group: 'Offense', desc: 'Offensive Line — Protect the QB, open holes in the run game' },
  { pos: 'DE',  label: 'DE',  group: 'Defense', desc: 'Defensive End — Edge rusher, QB sacks, run stopper' },
  { pos: 'DT',  label: 'DT',  group: 'Defense', desc: 'Defensive Tackle — Interior pressure, clog running lanes' },
  { pos: 'LB',  label: 'LB',  group: 'Defense', desc: 'Linebacker — Heart of the defense, tackles, coverage, blitzes' },
  { pos: 'CB',  label: 'CB',  group: 'Defense', desc: 'Cornerback — Shadow receivers, pick-sixes, shutdown corner' },
  { pos: 'S',   label: 'S',   group: 'Defense', desc: 'Safety — Last line of defense, range, big hits, interceptions' },
  { pos: 'K',   label: 'K',   group: 'Special', desc: 'Kicker — Field goals, clutch moments, game-winning kicks' },
  { pos: 'P',   label: 'P',   group: 'Special', desc: 'Punter — Field position, coffin-corner kicks, hangtime' },
]

const groups = ['Offense', 'Defense', 'Special']

const positionColors: Record<Position, string> = {
  QB: 'from-blue-600 to-blue-500',
  RB: 'from-green-600 to-green-500',
  WR: 'from-yellow-600 to-yellow-500',
  TE: 'from-orange-600 to-orange-500',
  OL: 'from-gray-600 to-gray-500',
  DE: 'from-red-600 to-red-500',
  DT: 'from-red-700 to-red-600',
  LB: 'from-purple-600 to-purple-500',
  CB: 'from-teal-600 to-teal-500',
  S: 'from-cyan-600 to-cyan-500',
  K: 'from-orange-600 to-orange-500',
  P: 'from-orange-700 to-orange-600',
}

interface PositionSelectorProps {
  value: Position
  onChange: (pos: Position) => void
}

export function PositionSelector({ value, onChange }: PositionSelectorProps) {
  const selected = POSITIONS.find(p => p.pos === value)

  return (
    <div className="space-y-4">
      {groups.map(group => (
        <div key={group} className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <h3 className="font-display font-700 text-sm text-gray-400 tracking-widest">{group.toUpperCase()}</h3>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {POSITIONS.filter(p => p.group === group).map(({ pos, label }) => (
              <button
                key={pos}
                onClick={() => onChange(pos)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  value === pos
                    ? 'border-orange-400 bg-orange-500/15'
                    : 'border-white/10 hover:border-white/25 hover:bg-white/5'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${positionColors[pos]} flex items-center justify-center mx-auto mb-1.5`}>
                  <span className="font-display font-800 text-sm text-white">{label}</span>
                </div>
                <span className={`text-xs font-medium ${value === pos ? 'text-orange-400' : 'text-gray-400'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {selected && (
        <div className="card p-4 border border-orange-500/20 bg-orange-500/5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${positionColors[selected.pos]} flex items-center justify-center shrink-0`}>
              <span className="font-display font-800 text-lg text-white">{selected.pos}</span>
            </div>
            <div>
              <p className="text-orange-400 font-medium text-sm">{selected.label} selected</p>
              <p className="text-gray-400 text-xs mt-0.5">{selected.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
