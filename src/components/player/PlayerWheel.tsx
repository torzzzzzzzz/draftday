'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { PoolPlayer, Position, grade, getPlayersForPosition, POSITION_PRIMARY_ATTRS } from '@/data/playerPool'
import { NFL_TEAMS } from '@/types/game'

interface WheelTeam {
  abbr: string
  name: string
  city: string
  conference: string
  division: string
}

interface WheelItem {
  player: PoolPlayer
  team: WheelTeam
}

interface ChosenAttribute {
  key: string
  label: string
  category: string
  rating: number
  playerName: string
  playerTeam: string
}

interface PlayerWheelProps {
  position: Position
  onComplete: (chosenAttributes: ChosenAttribute[], playerName: string) => void
  totalSlots?: number
}

const CATEGORY_COLORS: Record<string, string> = {
  PHYSICAL: 'var(--orange-400)',
  MENTAL:   'var(--navy-200)',
  SKILL:    'var(--green-300)',
}

function gradeColor(r: number): string {
  if (r >= 93) return 'var(--grade-aplus)'
  if (r >= 87) return 'var(--grade-a)'
  if (r >= 83) return 'var(--grade-aminus)'
  if (r >= 80) return 'var(--grade-bplus)'
  if (r >= 77) return 'var(--grade-b)'
  if (r >= 73) return 'var(--grade-bminus)'
  if (r >= 70) return 'var(--grade-cplus)'
  if (r >= 67) return 'var(--grade-c)'
  if (r >= 60) return 'var(--grade-d)'
  return 'var(--grade-f)'
}

function gradeBackground(r: number): string {
  if (r >= 90) return 'rgba(34, 197, 94, 0.15)'
  if (r >= 80) return 'rgba(59, 130, 246, 0.15)'
  if (r >= 70) return 'rgba(245, 158, 11, 0.15)'
  if (r >= 60) return 'rgba(249, 115, 22, 0.15)'
  return 'rgba(239, 68, 68, 0.1)'
}

function OVRRing({ value, size = 80 }: { value: number; size?: number }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(value, 99) / 99
  const dash = circumference * pct

  const color = value >= 85 ? 'var(--grade-a)' :
                value >= 75 ? 'var(--grade-b)' :
                value >= 65 ? 'var(--grade-c)' : 'var(--grade-d)'

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(90,122,185,0.2)" strokeWidth="5"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: size * 0.28, color: color, lineHeight: 1,
        }}>{value || '--'}</span>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: size * 0.14,
          color: 'var(--charcoal-300)', letterSpacing: '0.08em',
          textTransform: 'uppercase', marginTop: 1,
        }}>OVR</span>
      </div>
    </div>
  )
}

export default function PlayerWheel({ position, onComplete, totalSlots = 8 }: PlayerWheelProps) {
  const players = getPlayersForPosition(position)
  const teams: WheelTeam[] = NFL_TEAMS as unknown as WheelTeam[]

  const [phase, setPhase] = useState<'idle' | 'spinning' | 'revealed' | 'complete'>('idle')
  const [currentItem, setCurrentItem] = useState<WheelItem | null>(null)
  const [chosenAttributes, setChosenAttributes] = useState<ChosenAttribute[]>([])
  const [spinCount, setSpinCount] = useState(0)
  const [playerName, setPlayerName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [respinsLeft, setRespinsLeft] = useState({ team: 1, player: 1 })
  const [selectedAttrKey, setSelectedAttrKey] = useState<string | null>(null)

  // Track which attribute keys are already chosen
  const chosenKeys = new Set(chosenAttributes.map(a => a.key))

  // Reel offsets for animation
  const [teamOffset, setTeamOffset] = useState(0)
  const [playerOffset, setPlayerOffset] = useState(0)
  const teamReelRef = useRef<HTMLDivElement>(null)
  const playerReelRef = useRef<HTMLDivElement>(null)

  // All items for the reel (loop items for illusion)
  const teamItems = [...teams, ...teams, ...teams]
  const playerItems = [...players, ...players, ...players]

  const ITEM_HEIGHT = 72

  const pickRandom = useCallback(() => {
    const p = players[Math.floor(Math.random() * players.length)]
    const t = teams[Math.floor(Math.random() * teams.length)]
    return { player: p, team: t }
  }, [players, teams])

  const spin = useCallback(() => {
    if (phase === 'spinning') return
    setPhase('spinning')
    setSelectedAttrKey(null)

    const targetPlayerIdx = Math.floor(Math.random() * players.length) + players.length
    const targetTeamIdx  = Math.floor(Math.random() * teams.length)  + teams.length

    const extraSpins = 3 + Math.floor(Math.random() * 3)
    const pOffset = (targetPlayerIdx + extraSpins * players.length) * ITEM_HEIGHT
    const tOffset = (targetTeamIdx  + extraSpins * teams.length)  * ITEM_HEIGHT

    setPlayerOffset(pOffset)
    setTeamOffset(tOffset)

    const chosenPlayer = players[targetPlayerIdx % players.length]
    const chosenTeam   = teams[targetTeamIdx % teams.length]

    setTimeout(() => {
      setCurrentItem({ player: chosenPlayer, team: chosenTeam })
      setPhase('revealed')
      setSpinCount(c => c + 1)
    }, 1500)
  }, [phase, players, teams])

  const respinTeam = () => {
    if (respinsLeft.team <= 0 || !currentItem) return
    setRespinsLeft(r => ({ ...r, team: r.team - 1 }))
    const newTeam = teams[Math.floor(Math.random() * teams.length)]
    setCurrentItem({ ...currentItem, team: newTeam })
  }

  const respinPlayer = () => {
    if (respinsLeft.player <= 0 || !currentItem) return
    setRespinsLeft(r => ({ ...r, player: r.player - 1 }))
    const newPlayer = players[Math.floor(Math.random() * players.length)]
    setCurrentItem({ ...currentItem, player: newPlayer })
  }

  const selectAttribute = (attr: { key: string; label: string; category: string; rating: number }) => {
    if (!currentItem || chosenKeys.has(attr.key)) return
    setSelectedAttrKey(attr.key)
  }

  const confirmAttribute = () => {
    if (!currentItem || !selectedAttrKey) return

    const attr = currentItem.player.attributes.find(a => a.key === selectedAttrKey)
    if (!attr) return

    const chosen: ChosenAttribute = {
      key: attr.key,
      label: attr.label,
      category: attr.category,
      rating: attr.rating,
      playerName: currentItem.player.name,
      playerTeam: currentItem.team.abbr,
    }

    const newChosen = [...chosenAttributes, chosen]
    setChosenAttributes(newChosen)
    setRespinsLeft({ team: 1, player: 1 })
    setSelectedAttrKey(null)

    if (newChosen.length >= totalSlots) {
      setPhase('complete')
      setShowNameInput(true)
    } else {
      setPhase('idle')
      setCurrentItem(null)
    }
  }

  const handleComplete = () => {
    const name = playerName.trim() || `${position} ${spinCount}`
    onComplete(chosenAttributes, name)
  }

  const filledSlots = chosenAttributes.length
  const ovr = filledSlots === 0 ? 0 :
    Math.round(chosenAttributes.reduce((s, a) => s + a.rating, 0) / filledSlots)

  // Build slots display (all possible attribute keys for position)
  const positionAttrs = currentItem?.player.attributes || []
  // Get all unique attr keys seen across all attributes for this position
  const allAttrKeys = players[0]?.attributes.map(a => ({ key: a.key, label: a.label, category: a.category })) || []

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', maxWidth: 960, margin: '0 auto', padding: '0 1rem' }}>

      {/* ── LEFT: SPIN PANEL ── */}
      <div style={{ flex: '0 0 400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Reel area */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--r-xl)',
          overflow: 'hidden',
        }}>
          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            padding: '0.75rem 1rem',
            background: 'var(--navy-800)',
            borderBottom: '1px solid var(--border)',
          }}>
            <span className="text-label" style={{ color: 'var(--charcoal-200)' }}>Team</span>
            <span className="text-label" style={{ color: 'var(--charcoal-200)' }}>Player</span>
          </div>

          {/* Reels */}
          <div style={{ position: 'relative', height: 220 }}>
            {/* Selection highlight */}
            <div style={{
              position: 'absolute', left: 0, right: 0,
              top: '50%', transform: 'translateY(-50%)',
              height: ITEM_HEIGHT,
              background: 'rgba(249, 115, 22, 0.08)',
              borderTop: '1.5px solid rgba(249, 115, 22, 0.3)',
              borderBottom: '1.5px solid rgba(249, 115, 22, 0.3)',
              pointerEvents: 'none', zIndex: 5,
            }} />

            {/* Fade masks */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '30%',
              background: 'linear-gradient(to bottom, var(--bg-surface), transparent)',
              zIndex: 10, pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
              background: 'linear-gradient(to top, var(--bg-surface), transparent)',
              zIndex: 10, pointerEvents: 'none',
            }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%', overflow: 'hidden' }}>
              {/* Team reel */}
              <div style={{ overflow: 'hidden', borderRight: '1px solid var(--border)', position: 'relative' }}>
                <div
                  ref={teamReelRef}
                  style={{
                    transform: `translateY(-${teamOffset}px)`,
                    transition: phase === 'spinning' ? 'transform 1.4s cubic-bezier(0.1,0.7,0.3,1)' : 'none',
                  }}
                >
                  {teamItems.map((team, i) => (
                    <div key={i} style={{
                      height: ITEM_HEIGHT, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      padding: '0.5rem',
                      filter: phase === 'spinning' ? 'blur(1px)' : 'none',
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 800,
                        fontSize: '1.3rem', color: 'var(--offwhite)', lineHeight: 1,
                      }}>{team.abbr}</div>
                      <div style={{
                        fontSize: '0.65rem', color: 'var(--charcoal-300)',
                        marginTop: 3, textAlign: 'center', lineHeight: 1.2,
                      }}>{team.city}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Player reel */}
              <div style={{ overflow: 'hidden', position: 'relative' }}>
                <div
                  ref={playerReelRef}
                  style={{
                    transform: `translateY(-${playerOffset}px)`,
                    transition: phase === 'spinning' ? 'transform 1.4s cubic-bezier(0.1,0.7,0.3,1)' : 'none',
                  }}
                >
                  {playerItems.map((player, i) => (
                    <div key={i} style={{
                      height: ITEM_HEIGHT, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      padding: '0.5rem',
                      filter: phase === 'spinning' ? 'blur(1px)' : 'none',
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700,
                        fontSize: '0.85rem', color: 'var(--offwhite)', lineHeight: 1.2,
                        textAlign: 'center',
                      }}>{player.name.split('"')[0] || player.name}</div>
                      <div style={{
                        fontSize: '0.65rem', color: 'var(--accent)',
                        marginTop: 2, fontWeight: 600,
                      }}>{player.archetype}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SPIN button */}
        {(phase === 'idle') && (
          <button className="btn btn-primary btn-xl" onClick={spin} style={{ width: '100%', letterSpacing: '0.08em' }}>
            {spinCount === 0 ? '⚡ SPIN' : '⚡ SPIN AGAIN'}
          </button>
        )}
        {phase === 'spinning' && (
          <div style={{
            textAlign: 'center', padding: '1rem',
            fontFamily: 'var(--font-display)', fontWeight: 700,
            color: 'var(--charcoal-300)', letterSpacing: '0.08em',
            textTransform: 'uppercase', fontSize: '0.9rem',
          }}>
            Spinning...
          </div>
        )}

        {/* Revealed player card */}
        {phase === 'revealed' && currentItem && (
          <div className="player-card" style={{ animation: 'card-reveal 0.4s ease forwards' }}>
            {/* Player header */}
            <div className="player-card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800,
                    fontSize: '1.3rem', lineHeight: 1.1, color: 'var(--offwhite)',
                  }}>
                    {currentItem.player.name}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', alignItems: 'center' }}>
                    <span className="badge badge-orange">{currentItem.team.abbr}</span>
                    <span className="badge badge-navy">{currentItem.player.position}</span>
                    <span style={{ color: 'var(--charcoal-300)', fontSize: '0.75rem' }}>{currentItem.player.archetype}</span>
                  </div>
                </div>
                <OVRRing value={currentItem.player.overall} size={64} />
              </div>
            </div>

            {/* Attributes by category */}
            <div style={{ padding: '1rem' }}>
              {(['PHYSICAL', 'MENTAL', 'SKILL'] as const).map(cat => {
                const catAttrs = currentItem.player.attributes.filter(a => a.category === cat)
                return (
                  <div key={cat} style={{ marginBottom: '0.75rem' }}>
                    <div className="text-label" style={{ color: CATEGORY_COLORS[cat], marginBottom: '0.4rem', fontSize: '0.65rem' }}>
                      {cat}
                    </div>
                    {catAttrs.map(attr => {
                      const g = grade(attr.rating)
                      const isChosen = chosenKeys.has(attr.key)
                      const isSelected = selectedAttrKey === attr.key
                      return (
                        <div
                          key={attr.key}
                          className={`attribute-row ${isSelected ? 'selected' : ''}`}
                          onClick={() => !isChosen && selectAttribute(attr)}
                          style={{
                            opacity: isChosen ? 0.4 : 1,
                            cursor: isChosen ? 'not-allowed' : 'pointer',
                            marginBottom: '0.25rem',
                          }}
                        >
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{attr.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isChosen && (
                              <span style={{ fontSize: '0.65rem', color: 'var(--charcoal-400)', textTransform: 'uppercase' }}>locked</span>
                            )}
                            <div
                              className="grade-badge"
                              style={{
                                background: gradeBackground(attr.rating),
                                color: gradeColor(attr.rating),
                                fontSize: '0.95rem',
                                width: '2.25rem', height: '2.25rem',
                              }}
                            >
                              {g}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* Respin + confirm */}
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={respinTeam}
                disabled={respinsLeft.team <= 0}
                style={{ flex: 1 }}
              >
                Respin Team ({respinsLeft.team})
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={respinPlayer}
                disabled={respinsLeft.player <= 0}
                style={{ flex: 1 }}
              >
                Respin Player ({respinsLeft.player})
              </button>
              {selectedAttrKey && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={confirmAttribute}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                >
                  ✓ Claim Attribute
                </button>
              )}
              {!selectedAttrKey && (
                <div style={{
                  width: '100%', textAlign: 'center',
                  fontSize: '0.75rem', color: 'var(--charcoal-300)',
                  marginTop: '0.25rem',
                  fontFamily: 'var(--font-display)', textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  ↑ Tap an attribute to claim it
                </div>
              )}
            </div>
          </div>
        )}

        {/* Name input for complete state */}
        {showNameInput && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '1.25rem' }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--accent)',
              textTransform: 'uppercase',
            }}>
              🏈 Name Your Player
            </div>
            <input
              className="input"
              type="text"
              placeholder="Enter player name..."
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              maxLength={40}
              style={{ marginBottom: '0.75rem' }}
              onKeyDown={e => e.key === 'Enter' && handleComplete()}
              autoFocus
            />
            <button
              className="btn btn-primary"
              onClick={handleComplete}
              style={{ width: '100%' }}
              disabled={!playerName.trim()}
            >
              Create Player →
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT: BUILD PANEL ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* OVR + slots remaining */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--r-xl)',
          padding: '1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
        }}>
          <OVRRing value={ovr} size={72} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '1.1rem', color: 'var(--offwhite)', textTransform: 'uppercase',
            }}>
              Building Your Player
            </div>
            <div style={{ color: 'var(--charcoal-300)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {filledSlots} of {totalSlots} attributes selected
            </div>
            <div className="progress-bar" style={{ marginTop: '0.6rem' }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${(filledSlots / totalSlots) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Attribute slots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {allAttrKeys.slice(0, totalSlots).map((attrMeta, idx) => {
            const filled = chosenAttributes.find(a => a.key === attrMeta.key)
              || chosenAttributes[idx]

            return (
              <div
                key={idx}
                className={`draft-slot ${filled ? 'filled' : ''}`}
              >
                {filled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      className="grade-badge"
                      style={{
                        background: gradeBackground(filled.rating),
                        color: gradeColor(filled.rating),
                        fontSize: '0.85rem',
                        width: '2rem', height: '2rem', flexShrink: 0,
                        animation: 'grade-pop 0.4s ease forwards',
                      }}
                    >
                      {grade(filled.rating)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700,
                        fontSize: '0.9rem', color: 'var(--offwhite)', lineHeight: 1,
                      }}>{filled.label}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--charcoal-300)', marginTop: 2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {filled.playerName} · {filled.playerTeam}
                      </div>
                    </div>
                    <span
                      className="text-label"
                      style={{ color: CATEGORY_COLORS[filled.category], fontSize: '0.6rem', flexShrink: 0 }}
                    >
                      {filled.category}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '2rem', height: '2rem', borderRadius: 'var(--r-sm)',
                      background: 'var(--navy-700)', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', color: 'var(--charcoal-500)',
                    }}>{idx + 1}</div>
                    <span style={{ color: 'var(--charcoal-500)', fontSize: '0.85rem' }}>
                      Slot {idx + 1} — Spin to unlock
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Spins remaining hint */}
        {phase === 'idle' && filledSlots < totalSlots && filledSlots > 0 && (
          <div style={{
            marginTop: '1rem', textAlign: 'center',
            color: 'var(--charcoal-400)', fontSize: '0.8rem',
            fontFamily: 'var(--font-display)', textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {totalSlots - filledSlots} slot{totalSlots - filledSlots !== 1 ? 's' : ''} remaining — keep spinning
          </div>
        )}
      </div>
    </div>
  )
}
