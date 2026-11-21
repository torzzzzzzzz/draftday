'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface BottomNavProps {
  user: SupabaseUser | null
}

const links = (user: SupabaseUser | null) => [
  { href: '/',          label: 'Home',    icon: '🏠' },
  { href: '/career',    label: 'Career',  icon: '🏈' },
  { href: '/play',      label: 'Play',    icon: '⚡', highlight: true },
  { href: '/leaderboards', label: 'Ranks', icon: '🏆' },
  { href: user ? '/profile' : '/auth/login', label: user ? 'Profile' : 'Login', icon: '👤' },
]

export function BottomNav({ user }: BottomNavProps) {
  const pathname = usePathname()
  const navLinks = links(user)

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(7, 20, 40, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'stretch',
      zIndex: 40,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}
      className="bottom-nav-mobile"
    >
      {navLinks.map(({ href, label, icon, highlight }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: highlight ? '0.5rem 0.5rem 0.75rem' : '0.6rem 0.5rem 0.75rem',
              color: active ? 'var(--accent)' : 'var(--charcoal-400)',
              position: 'relative',
            }}
          >
            {highlight ? (
              <div style={{
                width: 42, height: 42,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--orange-600), var(--orange-400))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: -16,
                boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
                fontSize: '1.1rem',
              }}>
                {icon}
              </div>
            ) : (
              <span style={{ fontSize: '1.1rem' }}>{icon}</span>
            )}
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.6rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: highlight ? 2 : 0,
            }}>{label}</span>
            {active && !highlight && (
              <div style={{
                position: 'absolute', bottom: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: 20, height: 2,
                background: 'var(--accent)',
                borderRadius: '2px 2px 0 0',
              }} />
            )}
          </Link>
        )
      })}

      <style>{`
        @media (min-width: 768px) {
          .bottom-nav-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}
