'use client'

import type { Position } from '@/types/game'

const ATTRIBUTE_POINTS = 350  // total points to distribute among position-specific attrs

function getAttributeRating(val: number): { label: string; color: string } {
  if (val >= 90) return { label: 'Elite', color: '#25a56e' }
  if (val >= 80) return { label: 'Great', color: '#48c18a' }
  if (val >= 70) return { label: 'Good', color: '#fbbf24' }
  if (val >= 60) return { label: 'Average', color: '#f97316' }
  return { label: 'Poor', color: '#ef4444' }
}

function StatSlider({ label, value, field, onChange, min = 40, max = 95 }: {
  label: string
  value: number
  field: string
  onChange: (field: string, val: number) => void
  min?: number
  max?: number
}) {
  const { label: rating, color } = getAttributeRating(value)

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color }}>{rating}</span>
          <span className="text-sm font-bold text-white w-6 text-right">{value}</span>
        </div>
      </div>
      <div className="relative">
        <div className="stat-bar">
          <div
            className="stat-bar-fill"
            style={{
              width: `${((value - min) / (max - min)) * 100}%`,
              background: `linear-gradient(90deg, ${color}99, ${color})`
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(field, parseInt(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
    </div>
  )
}

interface AttributesEditorProps {
  position: Position
  build: any
  onChange: (updates: any) => void
}

export function AttributesEditor({ position, build, onChange }: AttributesEditorProps) {
  const handleChange = (field: string, val: number) => {
    onChange({ [field]: val })
  }

  return (
    <div className="card p-5 space-y-6">
      <div>
        <h2 className="font-display font-700 text-2xl text-white">Attributes</h2>
        <p className="text-gray-400 text-sm mt-1">Adjust sliders to shape your player's strengths. These will improve throughout your career.</p>
      </div>

      {/* Base attributes - all positions */}
      <div>
        <h3 className="font-display font-700 text-sm text-gray-500 tracking-widest mb-3">BASE ATTRIBUTES</h3>
        <StatSlider label="Speed" value={build.speed} field="speed" onChange={handleChange} />
        <StatSlider label="Strength" value={build.strength} field="strength" onChange={handleChange} />
        <StatSlider label="Agility" value={build.agility} field="agility" onChange={handleChange} />
        <StatSlider label="Awareness" value={build.awareness} field="awareness" onChange={handleChange} />
        <StatSlider label="Stamina" value={build.stamina} field="stamina" onChange={handleChange} />
      </div>

      {/* Position-specific */}
      {position === 'QB' && (
        <div>
          <h3 className="font-display font-700 text-sm text-gray-500 tracking-widest mb-3">QUARTERBACK</h3>
          <StatSlider label="Throw Power" value={build.throw_power || 70} field="throw_power" onChange={handleChange} />
          <StatSlider label="Throw Accuracy" value={build.throw_accuracy || 72} field="throw_accuracy" onChange={handleChange} />
          <StatSlider label="Throw on the Run" value={build.throw_on_run || 65} field="throw_on_run" onChange={handleChange} />
          <StatSlider label="Pocket Presence" value={build.pocket_presence || 70} field="pocket_presence" onChange={handleChange} />
        </div>
      )}

      {position === 'RB' && (
        <div>
          <h3 className="font-display font-700 text-sm text-gray-500 tracking-widest mb-3">RUNNING BACK</h3>
          <StatSlider label="Break Tackle" value={build.break_tackle || 72} field="break_tackle" onChange={handleChange} />
          <StatSlider label="Carrying" value={build.carrying || 72} field="carrying" onChange={handleChange} />
          <StatSlider label="Catching" value={build.catching || 65} field="catching" onChange={handleChange} />
        </div>
      )}

      {(position === 'WR' || position === 'TE') && (
        <div>
          <h3 className="font-display font-700 text-sm text-gray-500 tracking-widest mb-3">{position === 'WR' ? 'WIDE RECEIVER' : 'TIGHT END'}</h3>
          <StatSlider label="Catching" value={build.catching || 74} field="catching" onChange={handleChange} />
          <StatSlider label="Route Running" value={build.route_running || 70} field="route_running" onChange={handleChange} />
          <StatSlider label="Break Tackle" value={build.break_tackle || 60} field="break_tackle" onChange={handleChange} />
        </div>
      )}

      {position === 'OL' && (
        <div>
          <h3 className="font-display font-700 text-sm text-gray-500 tracking-widest mb-3">OFFENSIVE LINE</h3>
          <StatSlider label="Pass Block" value={build.pass_block || 72} field="pass_block" onChange={handleChange} />
          <StatSlider label="Run Block" value={build.run_block || 72} field="run_block" onChange={handleChange} />
        </div>
      )}

      {(position === 'DE' || position === 'DT') && (
        <div>
          <h3 className="font-display font-700 text-sm text-gray-500 tracking-widest mb-3">{position === 'DE' ? 'DEFENSIVE END' : 'DEFENSIVE TACKLE'}</h3>
          <StatSlider label="Tackle" value={build.tackle || 70} field="tackle" onChange={handleChange} />
          <StatSlider label="Pursuit" value={build.pursuit || 70} field="pursuit" onChange={handleChange} />
          <StatSlider label="Block Shedding" value={build.block_shedding || 68} field="block_shedding" onChange={handleChange} />
          <StatSlider label="Play Recognition" value={build.play_recognition || 65} field="play_recognition" onChange={handleChange} />
        </div>
      )}

      {position === 'LB' && (
        <div>
          <h3 className="font-display font-700 text-sm text-gray-500 tracking-widest mb-3">LINEBACKER</h3>
          <StatSlider label="Tackle" value={build.tackle || 72} field="tackle" onChange={handleChange} />
          <StatSlider label="Pursuit" value={build.pursuit || 70} field="pursuit" onChange={handleChange} />
          <StatSlider label="Zone Coverage" value={build.zone_coverage || 65} field="zone_coverage" onChange={handleChange} />
          <StatSlider label="Play Recognition" value={build.play_recognition || 68} field="play_recognition" onChange={handleChange} />
        </div>
      )}

      {(position === 'CB' || position === 'S') && (
        <div>
          <h3 className="font-display font-700 text-sm text-gray-500 tracking-widest mb-3">{position === 'CB' ? 'CORNERBACK' : 'SAFETY'}</h3>
          <StatSlider label="Man Coverage" value={build.man_coverage || 70} field="man_coverage" onChange={handleChange} />
          <StatSlider label="Zone Coverage" value={build.zone_coverage || 70} field="zone_coverage" onChange={handleChange} />
          <StatSlider label="Press Coverage" value={build.press_coverage || 65} field="press_coverage" onChange={handleChange} />
          <StatSlider label="Play Recognition" value={build.play_recognition || 68} field="play_recognition" onChange={handleChange} />
          <StatSlider label="Tackle" value={build.tackle || 65} field="tackle" onChange={handleChange} />
        </div>
      )}

      {(position === 'K' || position === 'P') && (
        <div>
          <h3 className="font-display font-700 text-sm text-gray-500 tracking-widest mb-3">{position === 'K' ? 'KICKER' : 'PUNTER'}</h3>
          <StatSlider label="Kick Power" value={build.kick_power || 72} field="kick_power" onChange={handleChange} />
          <StatSlider label="Kick Accuracy" value={build.kick_accuracy || 72} field="kick_accuracy" onChange={handleChange} />
        </div>
      )}

      <div className="p-3 bg-brand-500/5 border border-brand-500/15 rounded-xl">
        <p className="text-xs text-gray-500">
          💡 These are your starting attributes. Throughout your career, winning games, completing challenges, and training sessions will increase them.
        </p>
      </div>
    </div>
  )
}
