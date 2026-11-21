'use client'

import React, { useState, useCallback } from 'react'
import { PoolPlayer, Position, grade, getPlayersForPosition, POSITION_PRIMARY_ATTRS } from '@/data/playerPool'
import { NFL_TEAMS } from '@/types/game'

interface WheelTeam { abbr: string; name: string; city: string; conference: string; division: string }
interface WheelItem { player: PoolPlayer; team: WheelTeam }
interface ChosenAttribute { key: string; label: string; category: string; rating: number; playerName: string; playerTeam: string }
interface PlayerWheelProps {
  position: Position
  onComplete: (chosenAttributes: ChosenAttribute[], playerName: string) => void
  totalSlots?: number
}

const CAT_COLORS: Record<string, string> = {
  PHYSICAL: '#f97316',
  MENTAL: '#3b82f6',
  SKILL: '#22c55e',
}

function gradeColor(r: number) {
  if (r >= 93) return '#fbbf24'
  if (r >= 87) return '#22c55e'
  if (r >= 83) return '#4ade80'
  if (r >= 80) return '#60a5fa'
  if (r >= 77) return '#93c5fd'
  if (r >= 73) return '#f97316'
  if (r >= 70) return '#fb923c'
  if (r >= 65) return '#ef4444'
  return '#9ca3af'
}

function gradeBg(r: number) {
  if (r >= 90) return 'rgba(34,197,94,0.15)'
  if (r >= 80) return 'rgba(59,130,246,0.15)'
  if (r >= 70) return 'rgba(249,115,22,0.15)'
  return 'rgba(239,68,68,0.1)'
}

// Team color map for card background flavor
const TEAM_COLORS: Record<string, [string, string]> = {
  'KC': ['#E31837','#FFB81C'], 'SF': ['#AA0000','#B3995D'], 'DAL': ['#003594','#869397'],
  'GB': ['#203731','#FFB612'], 'BUF': ['#00338D','#C60C30'], 'PHI': ['#004C54','#A5ACAF'],
  'BAL': ['#241773','#9E7C0C'], 'CIN': ['#FB4F14','#000000'], 'DEN': ['#FB4F14','#002244'],
  'LV': ['#000000','#A5ACAF'], 'MIA': ['#008E97','#FC4C02'], 'NE': ['#002244','#C60C30'],
  'NYG': ['#0B2265','#A71930'], 'NYJ': ['#125740','#FFFFFF'], 'PIT': ['#FFB612','#101820'],
  'SEA': ['#002244','#69BE28'], 'LAR': ['#003594','#FFA300'], 'NO': ['#D3BC8D','#101820'],
  'ATL': ['#A71930','#000000'], 'CAR': ['#0085CA','#101820'], 'TB': ['#D50A0A','#FF7900'],
  'WAS': ['#5A1414','#FFB612'], 'CHI': ['#0B162A','#C83803'], 'DET': ['#0076B6','#B0B7BC'],
  'MIN': ['#4F2683','#FFC62F'], 'ARI': ['#97233F','#FFB612'], 'LA': ['#003594','#FFA300'],
  'HOU': ['#03202F','#A71930'], 'IND': ['#002C5F','#A2AAAD'], 'JAX': ['#006778','#D7A22A'],
  'TEN': ['#0C2340','#4B92DB'], 'CLE': ['#311D00','#FF3C00'],
}

// Player card SVG - position-specific silhouette in team colors
function PlayerCardSVG({ player, team, size = 180 }: { player: PoolPlayer; team: WheelTeam; size?: number }) {
  const [c1, c2] = TEAM_COLORS[team.abbr] || ['#1c3360', '#f97316']
  const pos = player.position
  const jerseyNum = player.name.length % 90 + 1
  const scale = size / 180

  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 180 252" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`cg_${team.abbr}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c1} stopOpacity="0.95"/>
          <stop offset="100%" stopColor={c2} stopOpacity="0.8"/>
        </linearGradient>
        <linearGradient id={`sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <clipPath id={`card_${team.abbr}`}>
          <rect x="0" y="0" width="180" height="252" rx="12"/>
        </clipPath>
      </defs>

      {/* Card background */}
      <rect x="0" y="0" width="180" height="252" rx="12" fill={`url(#cg_${team.abbr})`}/>
      {/* Sheen */}
      <rect x="0" y="0" width="180" height="252" rx="12" fill="url(#sheen)"/>
      {/* Pattern overlay */}
      <rect x="0" y="0" width="180" height="252" rx="12" fill="none" clipPath={`url(#card_${team.abbr})`}/>

      {/* Background diagonal stripes */}
      <g clipPath={`url(#card_${team.abbr})`} opacity="0.07">
        {[-4,-2,0,2,4,6,8].map(i => (
          <line key={i} x1={-20 + i*40} y1="0" x2={160 + i*40} y2="252" stroke="white" strokeWidth="20"/>
        ))}
      </g>

      {/* Player silhouette */}
      {/* Head/Helmet */}
      <ellipse cx="90" cy="62" rx="30" ry="32" fill="rgba(0,0,0,0.6)"/>
      <path d="M62 70 Q90 56 118 70" stroke={c2} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M65 76 L67 90 M76 70 L78 91 M102 70 L104 91 M113 76 L115 90" stroke="rgba(180,200,230,0.6)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M67 90 L115 90" stroke="rgba(180,200,230,0.6)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="90" cy="58" r="10" fill={`${c2}44`} stroke={`${c2}88`} strokeWidth="1.5"/>
      <text x="90" y="62" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="8" fill={c2}>DD</text>

      {/* Body */}
      <path d="M54 94 L126 94 L132 148 L48 148 Z" fill={c1}/>
      {/* Jersey stripes */}
      <path d="M54 94 L126 94 L128 106 L52 106 Z" fill={c2} opacity="0.5"/>
      {/* Jersey number */}
      <text x="90" y="135" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="34" fill="rgba(255,255,255,0.95)">
        {String(jerseyNum).padStart(2,'0')}
      </text>
      {/* Position label */}
      <rect x="77" y="140" width="26" height="12" rx="3" fill="rgba(0,0,0,0.5)"/>
      <text x="90" y="149" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="800" fontSize="8" fill={c2} letterSpacing="0.08em">{pos}</text>

      {/* Arms */}
      <path d="M54 100 L28 128 L38 136 L60 112 Z" fill="rgba(0,0,0,0.5)"/>
      <path d="M126 100 L152 128 L142 136 L120 112 Z" fill={c2} opacity="0.6"/>

      {/* Legs */}
      <path d="M62 148 L50 200 L65 203 L80 162 L102 196 L118 193 L105 148 Z" fill="rgba(0,0,0,0.6)"/>

      {/* OVR badge - top left */}
      <rect x="6" y="6" width="42" height="52" rx="6" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      <text x="27" y="38" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="22" fill="white">{player.overall}</text>
      <text x="27" y="50" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="700" fontSize="9" fill="rgba(255,255,255,0.6)" letterSpacing="0.08em">OVR</text>

      {/* POS badge - top right */}
      <rect x="132" y="6" width="42" height="28" rx="6" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      <text x="153" y="23" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="14" fill={c2}>{pos}</text>

      {/* Player name bar */}
      <rect x="0" y="210" width="180" height="42" fill="rgba(0,0,0,0.75)"/>
      <text x="90" y="228" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="13" fill="white" letterSpacing="0.03em">
        {player.name.length > 18 ? player.name.slice(0,16) + '…' : player.name}
      </text>
      <text x="90" y="244" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="700" fontSize="10" fill="rgba(255,255,255,0.5)" letterSpacing="0.06em">
        {team.abbr} · {player.archetype.toUpperCase()}
      </text>
    </svg>
  )
}

// Spinning wheel graphic
function SpinningWheel({ spinning, onClick, disabled }: { spinning: boolean; onClick: () => void; disabled: boolean }) {
  const slices = ['ARM', 'LEGS', 'MIND', 'SKILL', 'PHYS', 'IQ', 'POWER', 'SPEED']
  const colors = ['#f97316','#22c55e','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#ef4444']
  const r = 90, cx = 100, cy = 100
  const sliceAngle = (2 * Math.PI) / 8

  return (
    <div
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', position: 'relative', display: 'inline-block' }}
      onClick={!disabled ? onClick : undefined}
    >
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{
          animation: spinning ? 'wheelSpin 0.8s cubic-bezier(0.4,0,0.2,1) infinite' : 'none',
          filter: spinning ? 'drop-shadow(0 0 20px rgba(249,115,22,0.6))' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
          transition: 'filter 0.3s',
        }}
      >
        {/* Outer glow ring */}
        <circle cx={cx} cy={cy} r={r + 10} fill="none" stroke="rgba(249,115,22,0.2)" strokeWidth="8"/>
        <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke="rgba(249,115,22,0.15)" strokeWidth="3"/>

        {/* Wheel segments */}
        {slices.map((label, i) => {
          const startAngle = i * sliceAngle - Math.PI / 2
          const endAngle = startAngle + sliceAngle
          const x1 = cx + r * Math.cos(startAngle)
          const y1 = cy + r * Math.sin(startAngle)
          const x2 = cx + r * Math.cos(endAngle)
          const y2 = cy + r * Math.sin(endAngle)
          const midAngle = startAngle + sliceAngle / 2
          const lx = cx + (r * 0.72) * Math.cos(midAngle)
          const ly = cy + (r * 0.72) * Math.sin(midAngle)
          return (
            <g key={label}>
              <path
                d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                fill={colors[i]}
                opacity="0.88"
                stroke="rgba(5,8,15,0.6)"
                strokeWidth="2"
              />
              <text
                x={lx} y={ly + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="Barlow Condensed, sans-serif"
                fontWeight="800"
                fontSize="9"
                fill="rgba(255,255,255,0.95)"
                letterSpacing="0.06em"
              >
                {label}
              </text>
            </g>
          )
        })}

        {/* Center hub */}
        <circle cx={cx} cy={cy} r="24" fill="#05080f" stroke="rgba(249,115,22,0.5)" strokeWidth="2.5"/>
        <circle cx={cx} cy={cy} r="20" fill="rgba(249,115,22,0.1)"/>
        {spinning ? (
          <text x={cx} y={cy+5} textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="10" fill="#f97316">...</text>
        ) : (
          <text x={cx} y={cy+5} textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="10" fill="#f97316">SPIN</text>
        )}

        {/* Top pointer */}
        <polygon points={`${cx},${cy - r - 14} ${cx - 8},${cy - r} ${cx + 8},${cy - r}`} fill="#f97316"/>
        <polygon points={`${cx},${cy - r - 14} ${cx - 8},${cy - r} ${cx + 8},${cy - r}`} fill="none" stroke="rgba(249,115,22,0.5)" strokeWidth="1"/>
      </svg>

      {/* Click hint when not spinning */}
      {!spinning && !disabled && (
        <div style={{
          position: 'absolute',
          bottom: '-28px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700,
          fontSize: '11px',
          letterSpacing: '0.12em',
          color: 'rgba(249,115,22,0.7)',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          TAP TO SPIN
        </div>
      )}

      <style>{`
        @keyframes wheelSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Built attribute chip
function AttrChip({ attr }: { attr: ChosenAttribute }) {
  const g = grade(attr.rating)
  const color = gradeColor(attr.rating)
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: gradeBg(attr.rating),
      border: `1px solid ${color}44`,
      borderRadius: '10px',
      animation: 'chipIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        background: `${color}22`,
        border: `1.5px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Barlow Condensed, sans-serif',
        fontWeight: 900,
        fontSize: '14px',
        color,
        flexShrink: 0,
      }}>
        {g}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px', color: 'white', lineHeight: 1.1 }}>
          {attr.label}
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', lineHeight: 1, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {attr.playerName} · {attr.playerTeam}
        </div>
      </div>
      <div style={{
        fontSize: '10px',
        fontFamily: 'Barlow Condensed, sans-serif',
        fontWeight: 700,
        color: CAT_COLORS[attr.category],
        letterSpacing: '0.06em',
        flexShrink: 0,
      }}>
        {attr.category.slice(0,4)}
      </div>
    </div>
  )
}

export default function PlayerWheel({ position, onComplete, totalSlots = 8 }: PlayerWheelProps) {
  const players = getPlayersForPosition(position)
  const teams: WheelTeam[] = NFL_TEAMS as unknown as WheelTeam[]

  const [phase, setPhase] = useState<'idle' | 'spinning' | 'revealed' | 'naming'>('idle')
  const [currentItem, setCurrentItem] = useState<WheelItem | null>(null)
  const [chosenAttributes, setChosenAttributes] = useState<ChosenAttribute[]>([])
  const [spinCount, setSpinCount] = useState(0)
  const [playerName, setPlayerName] = useState('')
  const [respinsLeft, setRespinsLeft] = useState({ team: 1, player: 1 })
  const [selectedAttrKey, setSelectedAttrKey] = useState<string | null>(null)

  const chosenKeys = new Set(chosenAttributes.map(a => a.key))
  const filledSlots = chosenAttributes.length
  const ovr = filledSlots === 0 ? 0
    : Math.round(chosenAttributes.reduce((s, a) => s + a.rating, 0) / filledSlots)

  const spin = useCallback(() => {
    if (phase === 'spinning') return
    setPhase('spinning')
    setSelectedAttrKey(null)
    const p = players[Math.floor(Math.random() * players.length)]
    const t = teams[Math.floor(Math.random() * teams.length)]
    setTimeout(() => {
      setCurrentItem({ player: p, team: t })
      setPhase('revealed')
      setSpinCount(c => c + 1)
    }, 900)
  }, [phase, players, teams])

  const respinPlayer = () => {
    if (respinsLeft.player <= 0 || !currentItem) return
    setRespinsLeft(r => ({ ...r, player: r.player - 1 }))
    setCurrentItem({ ...currentItem, player: players[Math.floor(Math.random() * players.length)] })
    setSelectedAttrKey(null)
  }

  const respinTeam = () => {
    if (respinsLeft.team <= 0 || !currentItem) return
    setRespinsLeft(r => ({ ...r, team: r.team - 1 }))
    setCurrentItem({ ...currentItem, team: teams[Math.floor(Math.random() * teams.length)] })
  }

  const confirmAttribute = () => {
    if (!currentItem || !selectedAttrKey) return
    const attr = currentItem.player.attributes.find(a => a.key === selectedAttrKey)
    if (!attr) return

    const chosen: ChosenAttribute = {
      key: attr.key, label: attr.label, category: attr.category, rating: attr.rating,
      playerName: currentItem.player.name, playerTeam: currentItem.team.abbr,
    }
    const newChosen = [...chosenAttributes, chosen]
    setChosenAttributes(newChosen)
    setRespinsLeft({ team: 1, player: 1 })
    setSelectedAttrKey(null)

    if (newChosen.length >= totalSlots) {
      setPhase('naming')
      setCurrentItem(null)
    } else {
      setPhase('idle')
      setCurrentItem(null)
    }
  }

  // ── NAMING SCREEN ──
  if (phase === 'naming') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', color: '#22c55e', marginBottom: '8px', textTransform: 'uppercase' }}>
            PLAYER BUILT
          </div>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '40px', color: 'white', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            NAME YOUR <span style={{ color: '#f97316' }}>LEGEND</span>
          </h2>
          {/* OVR display */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: '16px',
            marginBottom: '24px',
          }}>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '48px', color: '#f97316', lineHeight: 1 }}>{ovr}</span>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: 'rgba(249,115,22,0.7)', letterSpacing: '0.12em' }}>OVERALL</div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '14px', color: 'white' }}>{position} RATING</div>
            </div>
          </div>
        </div>

        {/* Attribute summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '28px' }}>
          {chosenAttributes.map((attr, i) => <AttrChip key={i} attr={attr}/>)}
        </div>

        {/* Name input */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
          <label style={{ display: 'block', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '10px' }}>
            PLAYER NAME
          </label>
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Enter your player's name..."
            maxLength={40}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && playerName.trim() && onComplete(chosenAttributes, playerName.trim())}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.07)',
              border: '1.5px solid rgba(249,115,22,0.4)',
              borderRadius: '12px',
              padding: '14px 18px',
              color: 'white',
              fontSize: '20px',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700,
              outline: 'none',
              boxSizing: 'border-box',
              letterSpacing: '0.03em',
            }}
          />
          <button
            onClick={() => playerName.trim() && onComplete(chosenAttributes, playerName.trim())}
            disabled={!playerName.trim()}
            style={{
              marginTop: '14px',
              width: '100%',
              padding: '14px',
              background: playerName.trim() ? '#f97316' : 'rgba(249,115,22,0.3)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 900,
              fontSize: '16px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: playerName.trim() ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
          >
            CREATE PLAYER →
          </button>
        </div>
      </div>
    )
  }

  // ── MAIN WHEEL UI ──
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

      {/* LEFT: SPIN AREA */}
      <div style={{ flex: '0 0 460px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Progress bar */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 900,
            fontSize: '36px',
            color: '#f97316',
            lineHeight: 1,
            minWidth: '48px',
          }}>
            {ovr || '—'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                BUILDING PLAYER
              </span>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                {filledSlots}/{totalSlots} ATTRS
              </span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(filledSlots / totalSlots) * 100}%`,
                background: 'linear-gradient(90deg, #f97316, #fbbf24)',
                borderRadius: '99px',
                transition: 'width 0.5s ease',
              }}/>
            </div>
          </div>
        </div>

        {/* WHEEL + spin button */}
        {(phase === 'idle' || phase === 'spinning') && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '40px',
          }}>
            <SpinningWheel
              spinning={phase === 'spinning'}
              onClick={spin}
              disabled={phase === 'spinning'}
            />
            <button
              onClick={spin}
              disabled={phase === 'spinning'}
              style={{
                width: '100%',
                padding: '16px',
                background: phase === 'spinning' ? 'rgba(249,115,22,0.3)' : '#f97316',
                border: 'none',
                borderRadius: '14px',
                color: 'white',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 900,
                fontSize: '20px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: phase === 'spinning' ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: phase !== 'spinning' ? '0 4px 24px rgba(249,115,22,0.4)' : 'none',
              }}
            >
              {phase === 'spinning' ? '⚡ SPINNING...' : spinCount === 0 ? '⚡ SPIN NOW' : '⚡ SPIN AGAIN'}
            </button>
          </div>
        )}

        {/* REVEALED: Player card + attribute selection */}
        {phase === 'revealed' && currentItem && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            overflow: 'hidden',
            animation: 'revealIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
          }}>
            {/* Card + player info */}
            <div style={{ display: 'flex', gap: '16px', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <PlayerCardSVG player={currentItem.player} team={currentItem.team} size={120}/>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '20px', color: 'white', lineHeight: 1 }}>
                    {currentItem.player.name}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '6px', padding: '2px 8px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '12px', color: 'white' }}>
                      {currentItem.team.abbr}
                    </span>
                    <span style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '6px', padding: '2px 8px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '12px', color: '#f97316' }}>
                      {currentItem.player.position}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'Barlow Condensed, sans-serif', padding: '2px 4px' }}>
                      {currentItem.player.archetype}
                    </span>
                  </div>
                </div>
                {/* OVR ring */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    border: `3px solid ${gradeColor(currentItem.player.overall)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '18px', color: gradeColor(currentItem.player.overall), lineHeight: 1 }}>
                      {currentItem.player.overall}
                    </span>
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '8px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>OVR</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      SELECT ONE ATTRIBUTE
                    </div>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                      {totalSlots - filledSlots} slots remaining
                    </div>
                  </div>
                </div>
                {/* Respin buttons */}
                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                  <button onClick={respinPlayer} disabled={respinsLeft.player <= 0} style={{
                    flex: 1, padding: '7px 10px',
                    background: respinsLeft.player > 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px', color: respinsLeft.player > 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
                    fontSize: '11px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
                    cursor: respinsLeft.player > 0 ? 'pointer' : 'not-allowed', letterSpacing: '0.05em',
                  }}>
                    NEW PLAYER ({respinsLeft.player})
                  </button>
                  <button onClick={respinTeam} disabled={respinsLeft.team <= 0} style={{
                    flex: 1, padding: '7px 10px',
                    background: respinsLeft.team > 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px', color: respinsLeft.team > 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
                    fontSize: '11px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
                    cursor: respinsLeft.team > 0 ? 'pointer' : 'not-allowed', letterSpacing: '0.05em',
                  }}>
                    NEW TEAM ({respinsLeft.team})
                  </button>
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div style={{ padding: '16px' }}>
              {(['PHYSICAL', 'MENTAL', 'SKILL'] as const).map(cat => {
                const catAttrs = currentItem.player.attributes.filter(a => a.category === cat)
                return (
                  <div key={cat} style={{ marginBottom: '12px' }}>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '10px', letterSpacing: '0.15em', color: CAT_COLORS[cat], textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CAT_COLORS[cat] }}/>
                      {cat}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {catAttrs.map(attr => {
                        const g = grade(attr.rating)
                        const color = gradeColor(attr.rating)
                        const isChosen = chosenKeys.has(attr.key)
                        const isSelected = selectedAttrKey === attr.key
                        return (
                          <div
                            key={attr.key}
                            onClick={() => !isChosen && !isSelected ? setSelectedAttrKey(attr.key) : !isChosen ? setSelectedAttrKey(null) : null}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 12px',
                              background: isSelected
                                ? `${color}18`
                                : isChosen
                                ? 'rgba(255,255,255,0.02)'
                                : 'rgba(255,255,255,0.04)',
                              border: `1.5px solid ${isSelected ? color : isChosen ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}`,
                              borderRadius: '10px',
                              cursor: isChosen ? 'not-allowed' : 'pointer',
                              opacity: isChosen ? 0.4 : 1,
                              transition: 'all 0.15s',
                            }}
                          >
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              background: `${color}22`,
                              border: `1.5px solid ${color}55`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'Barlow Condensed, sans-serif',
                              fontWeight: 900,
                              fontSize: '16px',
                              color,
                              flexShrink: 0,
                            }}>
                              {g}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '14px', color: isChosen ? 'rgba(255,255,255,0.3)' : 'white', lineHeight: 1 }}>
                                {attr.label}
                              </div>
                              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px', fontFamily: 'Barlow Condensed, sans-serif' }}>
                                Rating: {attr.rating}
                              </div>
                            </div>
                            {isChosen && (
                              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, letterSpacing: '0.08em' }}>LOCKED</span>
                            )}
                            {isSelected && (
                              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <polyline points="1,5 4,8 9,2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Confirm button */}
              <button
                onClick={confirmAttribute}
                disabled={!selectedAttrKey}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '14px',
                  background: selectedAttrKey ? '#f97316' : 'rgba(249,115,22,0.2)',
                  border: 'none',
                  borderRadius: '12px',
                  color: selectedAttrKey ? 'white' : 'rgba(255,255,255,0.3)',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 900,
                  fontSize: '16px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: selectedAttrKey ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  boxShadow: selectedAttrKey ? '0 4px 20px rgba(249,115,22,0.4)' : 'none',
                }}
              >
                {selectedAttrKey ? '✓ CLAIM ATTRIBUTE' : 'SELECT AN ATTRIBUTE ABOVE'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: BUILD TRACKER */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700,
          fontSize: '11px',
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          marginBottom: '14px',
        }}>
          YOUR BUILD — {position}
        </div>

        {/* Attribute slots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {chosenAttributes.map((attr, i) => (
            <AttrChip key={i} attr={attr}/>
          ))}
          {/* Empty slots */}
          {Array.from({ length: totalSlots - filledSlots }).map((_, i) => (
            <div key={`empty_${i}`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.08)',
              borderRadius: '10px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
                fontSize: '12px', color: 'rgba(255,255,255,0.15)',
                flexShrink: 0,
              }}>
                {filledSlots + i + 1}
              </div>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '13px', color: 'rgba(255,255,255,0.2)' }}>
                SPIN TO UNLOCK
              </span>
            </div>
          ))}
        </div>

        {/* Category summary */}
        {filledSlots > 0 && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' }}>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '12px' }}>
              CATEGORY BREAKDOWN
            </div>
            {(['PHYSICAL', 'MENTAL', 'SKILL'] as const).map(cat => {
              const catAttrs = chosenAttributes.filter(a => a.category === cat)
              const avg = catAttrs.length > 0 ? Math.round(catAttrs.reduce((s, a) => s + a.rating, 0) / catAttrs.length) : 0
              return (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CAT_COLORS[cat], flexShrink: 0 }}/>
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.6)', flex: 1 }}>{cat}</span>
                  <div style={{ flex: 2, height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: catAttrs.length > 0 ? `${avg}%` : '0%', background: CAT_COLORS[cat], borderRadius: '99px', transition: 'width 0.5s ease' }}/>
                  </div>
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px', color: catAttrs.length > 0 ? CAT_COLORS[cat] : 'rgba(255,255,255,0.2)', minWidth: '28px', textAlign: 'right' }}>
                    {catAttrs.length > 0 ? avg : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes revealIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: none; }
        }
        @keyframes chipIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
