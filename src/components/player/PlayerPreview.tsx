'use client'

import type { Position } from '@/types/game'

interface PlayerPreviewProps {
  build: {
    name: string
    nickname?: string
    position: Position
    jersey_number: number
    skin_tone: string
    hair_style: string
    hair_color: string
    body_build: 'slim' | 'athletic' | 'power' | 'big'
    primary_color: string
    secondary_color: string
    helmet_style: string
    overall?: number
    speed?: number
    strength?: number
    agility?: number
    awareness?: number
    stamina?: number
  }
  overall: number
}

const positionBg: Record<Position, string> = {
  QB: '#1e3a5f', RB: '#1a3d1a', WR: '#3d3a1a', TE: '#3d2a1a',
  OL: '#2a2a2a', DE: '#3d1a1a', DT: '#3d1a1a', LB: '#2a1a3d',
  CB: '#1a3d3d', S: '#1a2a3d', K: '#1a3d2a', P: '#1a3d2a',
}

const SKIN_HEX: Record<string, string> = {
  very_light: '#f5d5b8', light: '#e8b88a', medium_light: '#d4956a',
  medium: '#b8743a', medium_dark: '#8b4513', dark: '#5c2e0a', very_dark: '#3d1a05',
}

function getOverallColor(ovr: number) {
  if (ovr >= 85) return '#25a56e'
  if (ovr >= 75) return '#fbbf24'
  if (ovr >= 65) return '#f97316'
  return '#ef4444'
}

function StatBar({ label, value }: { label: string; value: number }) {
  const pct = ((value - 40) / 55) * 100
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-0.5">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-bold" style={{ color: getOverallColor(value) }}>{value}</span>
      </div>
      <div className="stat-bar">
        <div
          className="stat-bar-fill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${getOverallColor(value)}88, ${getOverallColor(value)})`
          }}
        />
      </div>
    </div>
  )
}

export function PlayerPreview({ build, overall }: PlayerPreviewProps) {
  const skinColor = SKIN_HEX[build.skin_tone] || SKIN_HEX.medium
  const ovrColor = getOverallColor(overall)
  const bg = positionBg[build.position] || '#1a1a2a'

  return (
    <div className="card overflow-hidden">
      {/* Player card header */}
      <div
        className="relative p-6 flex flex-col items-center"
        style={{ background: `linear-gradient(135deg, ${bg}, rgba(10,14,12,0.9))` }}
      >
        {/* Overall badge */}
        <div className="absolute top-4 left-4 text-center">
          <div className="text-4xl font-display font-900" style={{ color: ovrColor }}>
            {overall}
          </div>
          <div className="text-xs text-gray-400 font-medium">OVR</div>
        </div>

        {/* Position badge */}
        <div
          className="absolute top-4 right-4 px-2.5 py-1 rounded-lg font-display font-800 text-sm"
          style={{ background: build.primary_color + '33', color: build.primary_color }}
        >
          {build.position}
        </div>

        {/* SVG Player silhouette */}
        <div className="mt-4 mb-4">
          <svg viewBox="0 0 120 180" width="120" height="180">
            {/* Jersey body */}
            <path
              d="M30,60 L20,80 L15,140 L50,140 L50,100 L70,100 L70,140 L105,140 L100,80 L90,60 L75,50 L60,55 L45,50 Z"
              fill={build.primary_color}
              stroke={build.secondary_color}
              strokeWidth="2"
            />
            {/* Neck */}
            <rect x="52" y="40" width="16" height="20" rx="4" fill={skinColor} />
            {/* Head */}
            <ellipse cx="60" cy="30" rx="20" ry="22" fill={skinColor} />
            {/* Helmet */}
            <path
              d="M38,32 Q38,8 60,8 Q82,8 82,32 L82,42 L78,42 L78,36 Q78,14 60,14 Q42,14 42,36 L42,42 L38,42 Z"
              fill={build.helmet_style === 'chrome' ? '#c0c0c0' :
                    build.helmet_style === 'gold' ? '#d4af37' :
                    build.helmet_style === 'matte' ? '#1a1a1a' :
                    build.primary_color}
            />
            {/* Jersey number */}
            <text
              x="60"
              y="88"
              textAnchor="middle"
              fill={build.secondary_color}
              fontSize="18"
              fontWeight="800"
              fontFamily="'Barlow Condensed', sans-serif"
            >
              {build.jersey_number}
            </text>
            {/* Arms */}
            <path d="M30,60 L10,90 L18,93 L38,68" fill={build.primary_color} stroke={build.secondary_color} strokeWidth="1" />
            <path d="M90,60 L110,90 L102,93 L82,68" fill={build.primary_color} stroke={build.secondary_color} strokeWidth="1" />
            {/* Pants */}
            <path d="M15,140 L20,165 L50,165 L55,140" fill={build.secondary_color === '#ffffff' ? '#e0e0e0' : build.secondary_color} />
            <path d="M105,140 L100,165 L70,165 L65,140" fill={build.secondary_color === '#ffffff' ? '#e0e0e0' : build.secondary_color} />
          </svg>
        </div>

        {/* Player name */}
        <h2 className="font-display font-800 text-2xl text-white text-center">
          {build.name || 'Your Player'}
        </h2>
        {build.nickname && (
          <p className="text-gray-400 text-sm">"{build.nickname}"</p>
        )}

        {/* Build type badge */}
        <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-400 capitalize">
          {build.body_build} Build
        </div>
      </div>

      {/* Stats */}
      <div className="p-4">
        <h3 className="font-display font-700 text-sm text-gray-500 tracking-widest mb-3">BASE ATTRIBUTES</h3>
        {build.speed !== undefined && <StatBar label="Speed" value={build.speed} />}
        {build.strength !== undefined && <StatBar label="Strength" value={build.strength} />}
        {build.agility !== undefined && <StatBar label="Agility" value={build.agility} />}
        {build.awareness !== undefined && <StatBar label="Awareness" value={build.awareness} />}
        {build.stamina !== undefined && <StatBar label="Stamina" value={build.stamina} />}
      </div>
    </div>
  )
}
