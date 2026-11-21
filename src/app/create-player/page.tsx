'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PlayerWheel from '@/components/player/PlayerWheel'
import { Position, POSITION_GROUPS, POSITION_LABELS, POSITION_PRIMARY_ATTRS } from '@/data/playerPool'

type Step = 'position' | 'wheel' | 'saving'

interface ChosenAttribute {
  key: string
  label: string
  category: string
  rating: number
  playerName: string
  playerTeam: string
}

export default function CreatePlayerPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('position')
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePositionSelect = (pos: Position) => {
    setSelectedPosition(pos)
    setStep('wheel')
  }

  const handleWheelComplete = async (chosenAttributes: ChosenAttribute[], playerName: string) => {
    if (!selectedPosition) return
    setStep('saving')
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Build attributes object from chosen attributes
      const attrs: Record<string, number> = {}
      for (const a of chosenAttributes) {
        attrs[a.key] = a.rating
      }

      // Calculate overall
      const ovr = chosenAttributes.length > 0
        ? Math.round(chosenAttributes.reduce((s, a) => s + a.rating, 0) / chosenAttributes.length)
        : 60

      // Map to position-specific stats for DB
      const position = selectedPosition
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const playerData: any = {
        user_id: user.id,
        name: playerName,
        position,
        overall: ovr,
        // Physical
        speed: attrs['legs'] ?? attrs['speed'] ?? 70,
        strength: attrs['size'] ?? attrs['strength'] ?? 70,
        agility: attrs['agility'] ?? 70,
        // Mental
        awareness: attrs['awareness'] ?? attrs['presnap'] ?? 70,
        // Skill
        catching: attrs['hands'] ?? attrs['catching'] ?? 70,
        route_running: attrs['routes'] ?? 70,
        // QB specific
        throw_power: attrs['arm'] ?? 70,
        throw_accuracy: attrs['accuracy'] ?? 70,
        // Appearances
        appearance: { hairColor: 'brown', skinTone: 'medium', helmet: 'standard', jersey: 'standard' },
        equipment: { helmet: 'standard', jersey: 'standard', cleats: 'standard', gloves: 'standard' },
        // Store chosen attributes
        attributes_data: chosenAttributes,
      }

      // Insert player
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert(playerData)
        .select()
        .single() as { data: { id: string } | null; error: unknown }

      if (playerError) throw playerError
      if (!player) throw new Error('Player creation failed')

      // Create career record
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const careerData: any = {
        user_id: user.id,
        player_id: (player as any).id,
        stage: 'high_school',
        season: 1,
        xp: 0,
        level: 1,
      }
      const { data: career, error: careerError } = await supabase
        .from('careers')
        .insert(careerData)
        .select()
        .single()

      if (careerError) throw careerError

      router.push(`/career?new=true`)
    } catch (err: unknown) {
      console.error(err)
      const msg = err instanceof Error ? err.message : 'Failed to create player'
      setError(msg)
      setStep('wheel')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy-950)',
      paddingBottom: '5rem',
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--navy-900)',
        borderBottom: '1px solid var(--border)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.6rem',
            textTransform: 'uppercase',
            lineHeight: 1,
            color: 'var(--offwhite)',
          }}>
            {step === 'position' ? 'Choose Position' :
             step === 'wheel' ? `Draft Your ${selectedPosition ? POSITION_LABELS[selectedPosition] : ''}` :
             'Creating Player...'}
          </h1>
          {step === 'wheel' && (
            <p style={{ color: 'var(--charcoal-300)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Spin to reveal attributes — pick one per spin
            </p>
          )}
        </div>
        {step === 'wheel' && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setStep('position'); setSelectedPosition(null) }}
          >
            ← Back
          </button>
        )}
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 'var(--r-md)',
          padding: '0.75rem 1.25rem',
          margin: '1rem 1.5rem',
          color: '#fca5a5',
          fontSize: '0.9rem',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Position selector */}
      {step === 'position' && (
        <div style={{ padding: '2rem 1.5rem', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '2.5rem', textTransform: 'uppercase',
              color: 'var(--offwhite)', lineHeight: 1,
            }}>
              What position do you play?
            </h2>
            <p style={{ color: 'var(--charcoal-300)', marginTop: '0.75rem' }}>
              Your position shapes the attributes you&apos;ll draft in the wheel
            </p>
          </div>

          {POSITION_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: '2rem' }}>
              <div className="text-label" style={{
                color: 'var(--charcoal-400)',
                marginBottom: '0.75rem',
                paddingLeft: '0.25rem',
              }}>
                {group.label}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {group.positions.map(pos => (
                  <button
                    key={pos}
                    onClick={() => handlePositionSelect(pos)}
                    style={{
                      background: 'var(--navy-800)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--r-lg)',
                      padding: '1.25rem 1rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget
                      el.style.borderColor = 'var(--accent)'
                      el.style.background = 'var(--navy-700)'
                      el.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget
                      el.style.borderColor = 'var(--border)'
                      el.style.background = 'var(--navy-800)'
                      el.style.transform = 'none'
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: '1.6rem',
                      color: 'var(--accent)',
                      lineHeight: 1,
                    }}>{pos}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      color: 'var(--charcoal-300)',
                      lineHeight: 1.2,
                    }}>{POSITION_LABELS[pos]}</span>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.25rem' }}>
                      {POSITION_PRIMARY_ATTRS[pos].slice(0, 3).map(a => (
                        <span key={a} style={{
                          fontSize: '0.55rem',
                          background: 'rgba(249,115,22,0.15)',
                          color: 'var(--orange-300)',
                          borderRadius: '3px',
                          padding: '0.1rem 0.35rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                        }}>{a}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wheel */}
      {step === 'wheel' && selectedPosition && (
        <div style={{ padding: '1.5rem 1rem' }}>
          <PlayerWheel
            position={selectedPosition}
            onComplete={handleWheelComplete}
            totalSlots={8}
          />
        </div>
      )}

      {/* Saving state */}
      {step === 'saving' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: '1.5rem',
        }}>
          <div style={{
            width: 64, height: 64,
            border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '1.5rem', textTransform: 'uppercase',
              color: 'var(--offwhite)',
            }}>
              Creating Your Player
            </div>
            <div style={{ color: 'var(--charcoal-300)', marginTop: '0.5rem' }}>
              Lacing up the cleats...
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
