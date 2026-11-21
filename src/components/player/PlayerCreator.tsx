'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react'
import type { Position } from '@/types/game'
import { PlayerPreview } from './PlayerPreview'
import { PositionSelector } from './PositionSelector'
import { AppearanceEditor } from './AppearanceEditor'
import { EquipmentEditor } from './EquipmentEditor'
import { AttributesEditor } from './AttributesEditor'

interface PlayerCreatorProps {
  userId: string
}

type Step = 'position' | 'name' | 'appearance' | 'equipment' | 'attributes' | 'confirm'

const STEPS: Step[] = ['position', 'name', 'appearance', 'equipment', 'attributes', 'confirm']

const STEP_LABELS = {
  position: 'Position',
  name: 'Identity',
  appearance: 'Appearance',
  equipment: 'Equipment',
  attributes: 'Attributes',
  confirm: 'Review',
}

export function PlayerCreator({ userId }: PlayerCreatorProps) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<Step>('position')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [build, setBuild] = useState({
    position: 'QB' as Position,
    name: '',
    nickname: '',
    skin_tone: 'medium',
    hair_style: 'short_fade',
    hair_color: 'black',
    face_style: 'face_1',
    body_build: 'athletic' as 'slim' | 'athletic' | 'power' | 'big',
    height_inches: 73,
    weight_lbs: 220,
    jersey_number: 1,
    helmet_style: 'standard',
    visor: null as string | null,
    gloves: null as string | null,
    cleats: null as string | null,
    sleeve: null as string | null,
    accessories: [] as string[],
    primary_color: '#25a56e',
    secondary_color: '#ffffff',
    uniform_style: 'modern',
    celebration: 'spike',
    // Base attributes
    speed: 72,
    strength: 65,
    agility: 70,
    awareness: 68,
    stamina: 75,
    // QB specific
    throw_power: 70,
    throw_accuracy: 72,
    throw_on_run: 65,
    pocket_presence: 70,
    // RB/WR/TE
    catching: null as number | null,
    route_running: null as number | null,
    break_tackle: null as number | null,
    carrying: null as number | null,
    // OL
    pass_block: null as number | null,
    run_block: null as number | null,
    // Defense
    tackle: null as number | null,
    pursuit: null as number | null,
    play_recognition: null as number | null,
    press_coverage: null as number | null,
    man_coverage: null as number | null,
    zone_coverage: null as number | null,
    block_shedding: null as number | null,
    // K/P
    kick_power: null as number | null,
    kick_accuracy: null as number | null,
  })

  const stepIdx = STEPS.indexOf(step)

  const computeOverall = () => {
    const pos = build.position
    const base = Math.round((build.speed + build.strength + build.agility + build.awareness + build.stamina) / 5)

    if (pos === 'QB') {
      const specific = Math.round(((build.throw_power || 70) + (build.throw_accuracy || 70) + (build.throw_on_run || 65) + (build.pocket_presence || 70)) / 4)
      return Math.round(base * 0.3 + specific * 0.7)
    }
    if (['WR','TE'].includes(pos)) {
      const specific = Math.round(((build.catching || 70) + (build.route_running || 68) + (build.break_tackle || 60)) / 3)
      return Math.round(base * 0.4 + specific * 0.6)
    }
    if (pos === 'RB') {
      const specific = Math.round(((build.break_tackle || 70) + (build.carrying || 70) + (build.catching || 65)) / 3)
      return Math.round(base * 0.35 + specific * 0.65)
    }
    if (pos === 'OL') {
      const specific = Math.round(((build.pass_block || 70) + (build.run_block || 70)) / 2)
      return Math.round(base * 0.3 + specific * 0.7)
    }
    if (['DE','DT','LB','CB','S'].includes(pos)) {
      const specific = Math.round(((build.tackle || 70) + (build.pursuit || 68) + (build.play_recognition || 65)) / 3)
      return Math.round(base * 0.3 + specific * 0.7)
    }
    if (['K','P'].includes(pos)) {
      const specific = Math.round(((build.kick_power || 72) + (build.kick_accuracy || 72)) / 2)
      return Math.round(base * 0.2 + specific * 0.8)
    }
    return base
  }

  const handleSave = async () => {
    if (!build.name.trim()) {
      setError('Please enter a player name')
      return
    }
    setSaving(true)
    setError('')

    try {
      const overall = computeOverall()
      const { data: player, error: playerError } = await (supabase as any)
        .from('players')
        .insert({
          user_id: userId,
          name: build.name.trim(),
          nickname: build.nickname?.trim() || null,
          position: build.position,
          skin_tone: build.skin_tone,
          hair_style: build.hair_style,
          hair_color: build.hair_color,
          face_style: build.face_style,
          body_build: build.body_build,
          height_inches: build.height_inches,
          weight_lbs: build.weight_lbs,
          jersey_number: build.jersey_number,
          helmet_style: build.helmet_style,
          visor: build.visor,
          gloves: build.gloves,
          cleats: build.cleats,
          sleeve: build.sleeve,
          accessories: build.accessories,
          primary_color: build.primary_color,
          secondary_color: build.secondary_color,
          uniform_style: build.uniform_style,
          celebration: build.celebration,
          overall,
          speed: build.speed,
          strength: build.strength,
          agility: build.agility,
          awareness: build.awareness,
          stamina: build.stamina,
          throw_power: build.position === 'QB' ? build.throw_power : null,
          throw_accuracy: build.position === 'QB' ? build.throw_accuracy : null,
          throw_on_run: build.position === 'QB' ? build.throw_on_run : null,
          pocket_presence: build.position === 'QB' ? build.pocket_presence : null,
          catching: ['WR','TE','RB'].includes(build.position) ? build.catching : null,
          route_running: ['WR','TE'].includes(build.position) ? build.route_running : null,
          break_tackle: ['RB','WR','TE'].includes(build.position) ? build.break_tackle : null,
          carrying: ['RB'].includes(build.position) ? build.carrying : null,
          pass_block: build.position === 'OL' ? build.pass_block : null,
          run_block: build.position === 'OL' ? build.run_block : null,
          tackle: ['DE','DT','LB','CB','S'].includes(build.position) ? build.tackle : null,
          pursuit: ['DE','DT','LB','CB','S'].includes(build.position) ? build.pursuit : null,
          play_recognition: ['DE','DT','LB','CB','S'].includes(build.position) ? build.play_recognition : null,
          press_coverage: ['CB','S'].includes(build.position) ? build.press_coverage : null,
          man_coverage: ['CB','S'].includes(build.position) ? build.man_coverage : null,
          zone_coverage: ['CB','S','LB'].includes(build.position) ? build.zone_coverage : null,
          block_shedding: ['DE','DT'].includes(build.position) ? build.block_shedding : null,
          kick_power: ['K','P'].includes(build.position) ? build.kick_power : null,
          kick_accuracy: ['K','P'].includes(build.position) ? build.kick_accuracy : null,
        })
        .select()
        .single()

      if (playerError) throw playerError

      // Create career
      const { error: careerError } = await (supabase as any).from('careers').insert({
        user_id: userId,
        player_id: player.id,
        stage: 'high_school',
        current_year: 1,
        season: 1,
        career_stats: {},
        story_flags: {},
      })

      if (careerError) throw careerError

      router.push('/career?new=true')
    } catch (err: any) {
      setError(err.message || 'Failed to create player. Please try again.')
      setSaving(false)
    }
  }

  const canNext = () => {
    if (step === 'name') return build.name.trim().length >= 2
    return true
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Steps sidebar */}
      <div className="lg:col-span-1">
        <div className="card p-4 space-y-1 sticky top-20">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => i <= stepIdx && setStep(s)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                s === step
                  ? 'bg-orange-500/20 text-orange-400'
                  : i < stepIdx
                    ? 'text-gray-300 hover:bg-white/5 cursor-pointer'
                    : 'text-gray-600 cursor-not-allowed'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                s === step
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : i < stepIdx
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                    : 'border-white/10 text-gray-600'
              }`}>
                {i < stepIdx ? <Check size={10} /> : i + 1}
              </span>
              <span className="font-medium">{STEP_LABELS[s]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main editor */}
      <div className="lg:col-span-2 space-y-4">
        {step === 'position' && (
          <PositionSelector
            value={build.position}
            onChange={(pos) => setBuild({ ...build, position: pos })}
          />
        )}

        {step === 'name' && (
          <div className="card p-6 space-y-4">
            <h2 className="font-display font-700 text-2xl text-white">Player Identity</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name *</label>
              <input
                type="text"
                value={build.name}
                onChange={(e) => setBuild({ ...build, name: e.target.value })}
                placeholder="e.g. Marcus Johnson"
                className="w-full"
                maxLength={40}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nickname (optional)</label>
              <input
                type="text"
                value={build.nickname}
                onChange={(e) => setBuild({ ...build, nickname: e.target.value })}
                placeholder='e.g. "The General"'
                className="w-full"
                maxLength={30}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Jersey #</label>
                <input
                  type="number"
                  value={build.jersey_number}
                  onChange={(e) => setBuild({ ...build, jersey_number: Math.min(99, Math.max(1, parseInt(e.target.value) || 1)) })}
                  min="1" max="99"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Build</label>
                <select
                  value={build.body_build}
                  onChange={(e) => setBuild({ ...build, body_build: e.target.value as any })}
                  className="w-full"
                >
                  <option value="slim">Slim (5'10" / 180lbs)</option>
                  <option value="athletic">Athletic (6'1" / 215lbs)</option>
                  <option value="power">Power (6'3" / 245lbs)</option>
                  <option value="big">Big (6'5" / 290lbs)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 'appearance' && (
          <AppearanceEditor build={build} onChange={(updates) => setBuild({ ...build, ...updates })} />
        )}

        {step === 'equipment' && (
          <EquipmentEditor build={build} onChange={(updates) => setBuild({ ...build, ...updates })} />
        )}

        {step === 'attributes' && (
          <AttributesEditor
            position={build.position}
            build={build}
            onChange={(updates) => setBuild({ ...build, ...updates })}
          />
        )}

        {step === 'confirm' && (
          <div className="card p-6 space-y-4">
            <h2 className="font-display font-700 text-2xl text-white">Review Your Player</h2>
            <div className="space-y-3">
              {[
                ['Position', build.position],
                ['Name', `${build.name}${build.nickname ? ` "${build.nickname}"` : ''}`],
                ['Jersey', `#${build.jersey_number}`],
                ['Build', build.body_build],
                ['Overall', computeOverall().toString()],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400 text-sm">{label}</span>
                  <span className="text-white font-medium text-sm">{value}</span>
                </div>
              ))}
            </div>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary w-full text-base py-3"
            >
              {saving ? (
                <><Loader2 size={18} className="animate-spin" /> Creating Player...</>
              ) : (
                <>Start Career 🏈</>
              )}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {stepIdx > 0 && (
            <button
              onClick={() => setStep(STEPS[stepIdx - 1])}
              className="btn btn-ghost flex items-center gap-2"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
          {stepIdx < STEPS.length - 1 && (
            <button
              onClick={() => canNext() && setStep(STEPS[stepIdx + 1])}
              disabled={!canNext()}
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {step === 'attributes' ? 'Review' : 'Next'} <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:col-span-2 sticky top-20">
        <PlayerPreview build={build} overall={computeOverall()} />
      </div>
    </div>
  )
}
