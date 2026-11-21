'use client'

import React from 'react'

interface DraftDayLogoProps {
  size?: number
  variant?: 'full' | 'icon'
  className?: string
}

export default function DraftDayLogo({ size = 40, variant = 'full', className = '' }: DraftDayLogoProps) {
  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Draft Day"
      >
        {/* Shield background */}
        <path
          d="M24 2L4 10V26C4 36 13 44 24 46C35 44 44 36 44 26V10L24 2Z"
          fill="#0d1f3d"
          stroke="rgba(90,122,185,0.4)"
          strokeWidth="1"
        />
        {/* Orange accent stripe at top */}
        <path
          d="M24 2L4 10V13L24 5L44 13V10L24 2Z"
          fill="#f97316"
          opacity="0.9"
        />
        {/* DD monogram */}
        {/* First D */}
        <path
          d="M9 16H14C18.4 16 21 19 21 23C21 27 18.4 30 14 30H9V16Z"
          fill="#f0f2f8"
        />
        <path
          d="M12 19V27H14C16.8 27 18 25.3 18 23C18 20.7 16.8 19 14 19H12Z"
          fill="#0d1f3d"
        />
        {/* Second D */}
        <path
          d="M23 16H28C32.4 16 35 19 35 23C35 27 32.4 30 28 30H23V16Z"
          fill="#f97316"
        />
        <path
          d="M26 19V27H28C30.8 27 32 25.3 32 23C32 20.7 30.8 19 28 19H26Z"
          fill="#0d1f3d"
        />
        {/* Football laces accent */}
        <line x1="37" y1="34" x2="43" y2="34" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="39" y1="31" x2="39" y2="37" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="41" y1="31" x2="41" y2="37" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg
      width={size * 4.5}
      height={size}
      viewBox="0 0 216 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Draft Day"
    >
      {/* Shield icon */}
      <path
        d="M24 2L4 10V26C4 36 13 44 24 46C35 44 44 36 44 26V10L24 2Z"
        fill="#0d1f3d"
        stroke="rgba(90,122,185,0.4)"
        strokeWidth="1"
      />
      <path
        d="M24 2L4 10V13L24 5L44 13V10L24 2Z"
        fill="#f97316"
        opacity="0.9"
      />
      {/* DD monogram */}
      <path d="M9 16H14C18.4 16 21 19 21 23C21 27 18.4 30 14 30H9V16Z" fill="#f0f2f8" />
      <path d="M12 19V27H14C16.8 27 18 25.3 18 23C18 20.7 16.8 19 14 19H12Z" fill="#0d1f3d" />
      <path d="M23 16H28C32.4 16 35 19 35 23C35 27 32.4 30 28 30H23V16Z" fill="#f97316" />
      <path d="M26 19V27H28C30.8 27 32 25.3 32 23C32 20.7 30.8 19 28 19H26Z" fill="#0d1f3d" />

      {/* DRAFT text */}
      <text
        x="52"
        y="30"
        fontFamily="'Barlow Condensed', 'Arial Narrow', sans-serif"
        fontWeight="800"
        fontSize="28"
        fill="#f0f2f8"
        letterSpacing="1"
        textAnchor="start"
        dominantBaseline="auto"
        style={{ textTransform: 'uppercase' }}
      >
        DRAFT
      </text>

      {/* DAY text — orange accent */}
      <text
        x="130"
        y="30"
        fontFamily="'Barlow Condensed', 'Arial Narrow', sans-serif"
        fontWeight="800"
        fontSize="28"
        fill="#f97316"
        letterSpacing="1"
        textAnchor="start"
        dominantBaseline="auto"
        style={{ textTransform: 'uppercase' }}
      >
        DAY
      </text>

      {/* Tagline */}
      <text
        x="52"
        y="43"
        fontFamily="'Barlow Condensed', 'Arial Narrow', sans-serif"
        fontWeight="600"
        fontSize="9"
        fill="rgba(140,170,210,0.7)"
        letterSpacing="2.5"
        textAnchor="start"
      >
        FOOTBALL CAREER SIMULATOR
      </text>
    </svg>
  )
}
