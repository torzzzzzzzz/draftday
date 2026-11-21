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

// Position-specific colors and descriptions
const POSITION_META: Record<string, { color: string; gradient: string; desc: string; role: string }> = {
  QB:  { color: '#f97316', gradient: 'linear-gradient(135deg,#7c2d12,#c2410c)', desc: 'Command the offense with pinpoint accuracy and elite decision-making.', role: 'Field General' },
  RB:  { color: '#22c55e', gradient: 'linear-gradient(135deg,#14532d,#15803d)', desc: 'Burst through gaps, break tackles, and take it to the house.', role: 'Ground Weapon' },
  WR:  { color: '#3b82f6', gradient: 'linear-gradient(135deg,#1e3a8a,#2563eb)', desc: 'Create separation and make circus catches downfield.', role: 'Deep Threat' },
  TE:  { color: '#f59e0b', gradient: 'linear-gradient(135deg,#78350f,#b45309)', desc: 'Dominate as a hybrid weapon — blocker and mismatch receiver.', role: 'Swiss Army Knife' },
  OL:  { color: '#8b5cf6', gradient: 'linear-gradient(135deg,#4c1d95,#6d28d9)', desc: 'The unsung heroes — protect the QB and open running lanes.', role: 'Trench Warrior' },
  DE:  { color: '#ef4444', gradient: 'linear-gradient(135deg,#7f1d1d,#b91c1c)', desc: 'Wreak havoc in the backfield and terrorize opposing QBs.', role: 'Pass Rush Monster' },
  DT:  { color: '#ec4899', gradient: 'linear-gradient(135deg,#831843,#be185d)', desc: 'Clog rushing lanes and demand double teams every play.', role: 'Interior Force' },
  LB:  { color: '#14b8a6', gradient: 'linear-gradient(135deg,#134e4a,#0f766e)', desc: 'Read the offense and control the middle of the field.', role: 'Team Quarterback' },
  CB:  { color: '#6366f1', gradient: 'linear-gradient(135deg,#312e81,#4338ca)', desc: 'Lock down elite receivers and make ball-hawking plays.', role: 'Island Shutdown' },
  S:   { color: '#a78bfa', gradient: 'linear-gradient(135deg,#4c1d95,#7c3aed)', desc: 'Range over the top and punish receivers coming across the middle.', role: 'Last Line of Defense' },
  K:   { color: '#fbbf24', gradient: 'linear-gradient(135deg,#78350f,#d97706)', desc: 'Ice nerves and clutch kicks when the game is on the line.', role: 'Clutch Specialist' },
  P:   { color: '#94a3b8', gradient: 'linear-gradient(135deg,#1e293b,#334155)', desc: 'Pin opponents deep and flip the field with every boot.', role: 'Field Position Expert' },
}

// Silhouette SVGs per position type
function PositionPlayerSVG({ pos, size = 320 }: { pos: string; size?: number }) {
  const scale = size / 320
  const meta = POSITION_META[pos] || POSITION_META['QB']
  const color = meta.color

  // Different silhouettes for different position archetypes
  const isSkill = ['QB','RB','WR','TE'].includes(pos)
  const isLineman = ['OL','DT'].includes(pos)
  const isPass = ['DE','LB'].includes(pos)

  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 320 448"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 0 40px ${color}44)` }}
    >
      <defs>
        <linearGradient id={`bodyGrad_${pos}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.6"/>
        </linearGradient>
        <filter id={`glow_${pos}`}>
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="160" cy="440" rx={isLineman ? 90 : 70} ry="8" fill="rgba(0,0,0,0.5)"/>

      {/* LEGS */}
      {isLineman ? (
        // Wide stance for linemen
        <path d="M105 265 L80 380 L105 384 L128 295 L155 375 L180 370 L155 265 Z" fill="#0f1a2e"/>
      ) : isPass ? (
        // Athletic crouch for pass rushers
        <path d="M108 262 L85 370 L108 374 L130 290 L152 365 L176 360 L152 262 Z" fill="#0f1a2e"/>
      ) : (
        // Running pose for skill positions
        <path d="M112 258 L88 365 L110 369 L132 285 L154 360 L178 355 L155 258 Z" fill="#0f1a2e"/>
      )}

      {/* BODY / JERSEY */}
      {isLineman ? (
        <path d="M78 148 L242 148 L252 268 L68 268 Z" fill={`url(#bodyGrad_${pos})`}/>
      ) : (
        <path d="M88 148 L232 148 L238 265 L82 265 Z" fill={`url(#bodyGrad_${pos})`}/>
      )}

      {/* Jersey shoulder detail */}
      <path d={isLineman ? "M78 148 L110 162 L110 148 Z" : "M88 148 L118 162 L118 148 Z"} fill={color} opacity="0.5"/>
      <path d={isLineman ? "M242 148 L212 162 L212 148 Z" : "M232 148 L202 162 L202 148 Z"} fill={color} opacity="0.5"/>

      {/* Jersey number */}
      <text
        x="160" y={isLineman ? 220 : 215}
        textAnchor="middle"
        fontFamily="Barlow Condensed, sans-serif"
        fontWeight="900"
        fontSize={isLineman ? "58" : "52"}
        fill="rgba(255,255,255,0.95)"
        filter={`url(#glow_${pos})`}
      >
        {pos === 'QB' ? '12' : pos === 'RB' ? '21' : pos === 'WR' ? '11' : pos === 'TE' ? '84' :
         pos === 'DE' ? '99' : pos === 'DT' ? '98' : pos === 'LB' ? '52' : pos === 'CB' ? '24' :
         pos === 'S' ? '32' : pos === 'OL' ? '73' : pos === 'K' ? '3' : '5'}
      </text>

      {/* Position tag on jersey */}
      <rect x="143" y="232" width="34" height="16" rx="3" fill="rgba(0,0,0,0.5)"/>
      <text x="160" y="244" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="800" fontSize="10" fill={color} letterSpacing="0.1em">{pos}</text>

      {/* ARMS */}
      {isLineman ? (
        <>
          <path d="M78 155 L35 215 L52 228 L92 175 Z" fill="#0f1a2e"/>
          <path d="M242 155 L285 215 L268 228 L228 175 Z" fill={color} opacity="0.8"/>
        </>
      ) : pos === 'QB' ? (
        // QB throwing pose - arm raised
        <>
          <path d="M88 158 L45 205 L62 218 L100 175 Z" fill="#0f1a2e"/>
          <path d="M232 155 L275 108 L262 98 L222 148 Z" fill={color} opacity="0.85"/>
        </>
      ) : (
        <>
          <path d="M88 158 L48 210 L65 222 L100 178 Z" fill="#0f1a2e"/>
          <path d="M232 158 L268 205 L252 218 L220 175 Z" fill={color} opacity="0.8"/>
        </>
      )}

      {/* NECK */}
      <rect x={isLineman ? "146" : "148"} y="122" width="28" height="28" rx="6" fill="#c8a882"/>

      {/* HELMET - large and detailed */}
      <ellipse cx="160" cy={isLineman ? "96" : "98"} rx={isLineman ? "52" : "48"} ry="52" fill="#0d1f3a"/>

      {/* Helmet shine */}
      <ellipse cx="142" cy={isLineman ? "72" : "74"} rx="18" ry="13" fill="rgba(255,255,255,0.07)" transform={`rotate(-20 142 ${isLineman ? 72 : 74})`}/>

      {/* Helmet color stripe */}
      <path d={isLineman ? "M110 55 Q160 40 210 55 L215 85 Q160 70 105 85 Z" : "M113 55 Q160 42 207 55 L212 82 Q160 68 108 82 Z"} fill={color} opacity="0.6"/>

      {/* Facemask bar */}
      <path d={isLineman ? "M113 110 Q160 92 207 110" : "M115 112 Q160 95 205 112"} stroke={color} strokeWidth="5" fill="none" strokeLinecap="round"/>

      {/* Facemask vertical bars */}
      <path d={isLineman ? "M118 116 L121 142 M133 108 L136 143 M187 108 L190 143 M202 116 L205 142" : "M120 118 L122 142 M134 110 L136 143 M184 110 L186 143 M198 118 L200 142"} stroke="#6b8bb0" strokeWidth="3" strokeLinecap="round"/>
      <path d={isLineman ? "M121 142 L205 142" : "M122 142 L200 142"} stroke="#6b8bb0" strokeWidth="3" strokeLinecap="round"/>
      <path d={isLineman ? "M121 130 L205 130" : "M122 130 L200 130"} stroke="#6b8bb0" strokeWidth="2" strokeLinecap="round"/>

      {/* DD helmet logo */}
      <circle cx="160" cy={isLineman ? "90" : "92"} r="16" fill={`${color}33`} stroke={`${color}88`} strokeWidth="2"/>
      <text x="160" y={isLineman ? "96" : "98"} textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="900" fontSize="13" fill={color} letterSpacing="-0.02em">DD</text>

      {/* FOOTBALL for skill positions */}
      {isSkill && (
        <g transform={pos === 'QB' ? "rotate(-45 265 108)" : "rotate(-20 215 220)"}>
          <ellipse cx={pos === 'QB' ? "265" : "215"} cy={pos === 'QB' ? "108" : "220"} rx="22" ry="13" fill="#7c4f2a" stroke="#5a3519" strokeWidth="2"/>
          <line x1={pos === 'QB' ? "250" : "200"} y1={pos === 'QB' ? "108" : "220"} x2={pos === 'QB' ? "280" : "230"} y2={pos === 'QB' ? "108" : "220"} stroke="white" strokeWidth="1.5"/>
          <line x1={pos === 'QB' ? "265" : "215"} y1={pos === 'QB' ? "97" : "209"} x2={pos === 'QB' ? "265" : "215"} y2={pos === 'QB' ? "119" : "231"} stroke="white" strokeWidth="1.2"/>
        </g>
      )}

      {/* GLOVES */}
      <ellipse cx={isLineman ? "30" : "38"} cy="228" rx="14" ry="11" fill="#0d1f3a"/>
      <ellipse cx={isLineman ? "290" : "268"} cy={pos === 'QB' ? "98" : "222"} rx="14" ry="11" fill={color} opacity="0.9" transform={pos === 'QB' ? "rotate(-45 268 98)" : "rotate(-15 268 222)"}/>

      {/* SHOES */}
      <path d="M82 376 Q95 390 118 386 L118 377 Q100 381 90 370 Z" fill="#05080f" stroke="#0f1a2e" strokeWidth="1"/>
      <path d={isLineman ? "M148 374 Q160 388 182 383 L182 374 Q168 379 158 368 Z" : "M145 368 Q158 382 180 378 L180 369 Q166 374 156 362 Z"} fill="#05080f" stroke="#0f1a2e" strokeWidth="1"/>

      {/* Cleats detail */}
      <line x1="88" y1="388" x2="84" y2="395" stroke="#1a2a40" strokeWidth="2"/>
      <line x1="98" y1="388" x2="96" y2="396" stroke="#1a2a40" strokeWidth="2"/>
      <line x1="156" y1={isLineman ? "386" : "380"} x2="152" y2={isLineman ? "393" : "387"} stroke="#1a2a40" strokeWidth="2"/>
      <line x1="166" y1={isLineman ? "385" : "379"} x2="164" y2={isLineman ? "393" : "386"} stroke="#1a2a40" strokeWidth="2"/>
    </svg>
  )
}

export default function CreatePlayerPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('position')
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [hoveredPosition, setHoveredPosition] = useState<Position | null>(null)
  const [error, setError] = useState<string | null>(null)

  const displayPos = hoveredPosition || selectedPosition

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
      if (!user) { router.push('/auth/login'); return }

      const attrs: Record<string, number> = {}
      for (const a of chosenAttributes) attrs[a.key] = a.rating
      const ovr = chosenAttributes.length > 0
        ? Math.round(chosenAttributes.reduce((s, a) => s + a.rating, 0) / chosenAttributes.length)
        : 60

      const position = selectedPosition
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const playerData: any = {
        user_id: user.id,
        name: playerName,
        position,
        overall: ovr,
        speed: attrs['legs'] ?? attrs['speed'] ?? 70,
        strength: attrs['size'] ?? attrs['strength'] ?? 70,
        agility: attrs['agility'] ?? 70,
        awareness: attrs['awareness'] ?? attrs['presnap'] ?? 70,
        catching: attrs['hands'] ?? attrs['catching'] ?? 70,
        route_running: attrs['routes'] ?? 70,
        throw_power: attrs['arm'] ?? 70,
        throw_accuracy: attrs['accuracy'] ?? 70,
        appearance: { hairColor: 'brown', skinTone: 'medium', helmet: 'standard', jersey: 'standard' },
        equipment: { helmet: 'standard', jersey: 'standard', cleats: 'standard', gloves: 'standard' },
        attributes_data: chosenAttributes,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: player, error: playerError } = await supabase
        .from('players').insert(playerData).select().single() as { data: { id: string } | null; error: unknown }

      if (playerError) throw playerError
      if (!player) throw new Error('Player creation failed')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const careerData: any = { user_id: user.id, player_id: (player as any).id, stage: 'high_school', season: 1, xp: 0, level: 1 }
      const { error: careerError } = await supabase.from('careers').insert(careerData).select().single()
      if (careerError) throw careerError

      router.push(`/career?new=true`)
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to create player')
      setStep('wheel')
    }
  }

  // ── POSITION SELECTOR (Madden-style) ──
  if (step === 'position') {
    const meta = displayPos ? POSITION_META[displayPos] : null

    return (
      <div style={{
        minHeight: '100vh',
        background: '#05080f',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Full-screen background - dynamic per position */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: displayPos
            ? `radial-gradient(ellipse 60% 80% at 70% 50%, ${POSITION_META[displayPos].color}18 0%, transparent 70%)`
            : 'radial-gradient(ellipse 60% 80% at 70% 50%, rgba(249,115,22,0.08) 0%, transparent 70%)',
          transition: 'background 0.4s ease',
        }}/>

        {/* Stadium atmosphere lines */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0 1px, transparent 1px 80px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0 1px, transparent 1px 80px)
          `,
        }}/>

        {/* Back button */}
        <div style={{ position: 'relative', zIndex: 10, padding: '20px 32px' }}>
          <button
            onClick={() => router.push('/')}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '8px 16px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, letterSpacing: '0.05em' }}
          >
            ← BACK
          </button>
        </div>

        {/* Main layout: Player art LEFT, selection RIGHT */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 48px', gap: '48px', position: 'relative', zIndex: 5 }}>

          {/* LEFT — Large player preview */}
          <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', minHeight: '520px', position: 'relative' }}>
            {displayPos ? (
              <>
                {/* Position glow behind player */}
                <div style={{
                  position: 'absolute',
                  bottom: '10%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '300px',
                  height: '300px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${POSITION_META[displayPos].color}30 0%, transparent 70%)`,
                  transition: 'background 0.4s ease',
                }}/>
                <div style={{ transition: 'opacity 0.3s ease', opacity: 1 }}>
                  <PositionPlayerSVG pos={displayPos} size={300}/>
                </div>
                {/* Role badge */}
                <div style={{
                  marginTop: '12px',
                  padding: '6px 20px',
                  background: `${POSITION_META[displayPos].color}22`,
                  border: `1px solid ${POSITION_META[displayPos].color}55`,
                  borderRadius: '999px',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 700,
                  fontSize: '12px',
                  letterSpacing: '0.12em',
                  color: POSITION_META[displayPos].color,
                  textTransform: 'uppercase',
                }}>
                  {POSITION_META[displayPos].role}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', letterSpacing: '0.1em' }}>
                <div style={{ fontSize: '72px', marginBottom: '16px', opacity: 0.4 }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <ellipse cx="40" cy="40" rx="34" ry="22" fill="#6b4226" stroke="#4a2c14" strokeWidth="2.5"/>
                    <line x1="12" y1="40" x2="68" y2="40" stroke="white" strokeWidth="2"/>
                    <line x1="34" y1="26" x2="34" y2="54" stroke="white" strokeWidth="2"/>
                    <line x1="46" y1="26" x2="46" y2="54" stroke="white" strokeWidth="2"/>
                  </svg>
                </div>
                HOVER A POSITION<br/>TO PREVIEW
              </div>
            )}
          </div>

          {/* RIGHT — Position info + selection */}
          <div style={{ flex: 1 }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: displayPos ? POSITION_META[displayPos].color : '#f97316',
                marginBottom: '8px',
                transition: 'color 0.3s ease',
              }}>
                CHOOSE YOUR POSITION
              </div>
              <h1 style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 900,
                fontSize: '52px',
                lineHeight: 0.9,
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                color: 'white',
                marginBottom: '12px',
              }}>
                {displayPos ? POSITION_LABELS[displayPos as Position] : 'BUILD YOUR'}
                <br/>
                <span style={{ color: displayPos ? POSITION_META[displayPos].color : '#f97316', transition: 'color 0.3s ease' }}>
                  {displayPos ? 'AWAITS YOU' : 'PLAYER'}
                </span>
              </h1>
              {displayPos && (
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.5, maxWidth: '380px' }}>
                  {POSITION_META[displayPos].desc}
                </p>
              )}
            </div>

            {/* Position groups */}
            {POSITION_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: '20px' }}>
                <div style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.35)',
                  marginBottom: '10px',
                  paddingLeft: '2px',
                }}>
                  {group.label}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {group.positions.map(pos => {
                    const pmeta = POSITION_META[pos]
                    const isHovered = hoveredPosition === pos
                    const isSelected = selectedPosition === pos
                    return (
                      <button
                        key={pos}
                        onMouseEnter={() => setHoveredPosition(pos)}
                        onMouseLeave={() => setHoveredPosition(null)}
                        onClick={() => handlePositionSelect(pos)}
                        style={{
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '14px 20px 12px',
                          background: isHovered || isSelected
                            ? `${pmeta.color}22`
                            : 'rgba(255,255,255,0.05)',
                          border: `2px solid ${isHovered || isSelected ? pmeta.color : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          transform: isHovered ? 'translateY(-3px) scale(1.05)' : 'none',
                          boxShadow: isHovered ? `0 8px 24px ${pmeta.color}44` : 'none',
                          minWidth: '80px',
                        }}
                      >
                        <span style={{
                          fontFamily: 'Barlow Condensed, sans-serif',
                          fontWeight: 900,
                          fontSize: '28px',
                          lineHeight: 1,
                          color: isHovered || isSelected ? pmeta.color : 'white',
                          transition: 'color 0.15s',
                        }}>
                          {pos}
                        </span>
                        <span style={{
                          fontFamily: 'Barlow Condensed, sans-serif',
                          fontWeight: 600,
                          fontSize: '9px',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: isHovered || isSelected ? pmeta.color : 'rgba(255,255,255,0.4)',
                          lineHeight: 1.2,
                          textAlign: 'center',
                          transition: 'color 0.15s',
                        }}>
                          {POSITION_LABELS[pos].split(' ').slice(0, 2).join(' ')}
                        </span>
                        {/* Key attributes preview */}
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
                          {POSITION_PRIMARY_ATTRS[pos].slice(0, 2).map(a => (
                            <span key={a} style={{
                              fontSize: '8px',
                              background: `${pmeta.color}22`,
                              color: pmeta.color,
                              borderRadius: '3px',
                              padding: '1px 5px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontFamily: 'Barlow Condensed, sans-serif',
                              fontWeight: 700,
                              opacity: isHovered ? 1 : 0.6,
                              transition: 'opacity 0.15s',
                            }}>{a}</span>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom instruction bar */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          padding: '16px 48px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.08em' }}>
            DRAFT DAY — FOOTBALL CAREER SIMULATOR
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.08em' }}>
            {displayPos ? '← CLICK TO SELECT' : 'HOVER TO PREVIEW · CLICK TO SELECT'}
          </div>
        </div>
      </div>
    )
  }

  // ── WHEEL STEP ──
  if (step === 'wheel' && selectedPosition) {
    return (
      <div style={{ minHeight: '100vh', background: '#05080f', paddingBottom: '5rem' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(5,8,15,0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => { setStep('position'); setSelectedPosition(null) }}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, letterSpacing: '0.05em' }}
            >
              ← POSITION
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  background: `${POSITION_META[selectedPosition]?.color}22`,
                  border: `1px solid ${POSITION_META[selectedPosition]?.color}55`,
                  color: POSITION_META[selectedPosition]?.color,
                  borderRadius: '8px',
                  padding: '3px 10px',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 900,
                  fontSize: '18px',
                }}>
                  {selectedPosition}
                </span>
                <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'white', margin: 0 }}>
                  DRAFT YOUR {POSITION_LABELS[selectedPosition].toUpperCase()}
                </h1>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '2px 0 0', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em' }}>
                SPIN · PICK AN ATTRIBUTE · REPEAT 8 TIMES
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px',
            padding: '12px 20px',
            margin: '16px 32px',
            color: '#fca5a5',
            fontSize: '14px',
            fontFamily: 'Barlow Condensed, sans-serif',
          }}>
            Error: {error}
          </div>
        )}

        <div style={{ padding: '24px 16px' }}>
          <PlayerWheel
            position={selectedPosition}
            onComplete={handleWheelComplete}
            totalSlots={8}
          />
        </div>
      </div>
    )
  }

  // ── SAVING ──
  return (
    <div style={{
      minHeight: '100vh',
      background: '#05080f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
    }}>
      <div style={{
        width: 80, height: 80,
        border: '4px solid rgba(249,115,22,0.2)',
        borderTopColor: '#f97316',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}/>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'white' }}>
          CREATING YOUR PLAYER
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', marginTop: '8px', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '14px', letterSpacing: '0.08em' }}>
          LACING UP THE CLEATS...
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
