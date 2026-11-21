'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import DraftDayLogo from './DraftDayLogo'

interface NavBarProps {
  user: SupabaseUser | null
  profile: {
    id: string
    username: string
    display_name: string | null
    coins: number
    level: number
    xp: number
    battle_pass_tier: number
  } | null
}

const NAV_LINKS = [
  { href: '/',            label: 'Home' },
  { href: '/career',     label: 'Career' },
  { href: '/play',       label: 'Play' },
  { href: '/leaderboards', label: 'Ranks' },
  { href: '/friends',    label: 'Friends' },
  { href: '/challenges', label: 'Challenges' },
  { href: '/battle-pass', label: 'Battle Pass' },
  { href: '/shop',       label: 'Shop' },
]

export function NavBar({ user, profile }: NavBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(7, 20, 40, 0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      height: 60,
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.25rem', gap: '1rem',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <DraftDayLogo size={34} variant="full" />
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flex: 1, justifyContent: 'center' }}
             className="desktop-nav">
          {NAV_LINKS.slice(0, 6).map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--r-md)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--accent)' : 'var(--charcoal-200)',
                  background: isActive ? 'rgba(249,115,22,0.1)' : 'transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {user && profile ? (
            <>
              {/* Coins */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: 'var(--navy-800)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)', padding: '0.3rem 0.75rem',
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '0.85rem', color: 'var(--orange-300)',
              }}
                className="hide-mobile">
                🪙 {profile.coins.toLocaleString()}
              </div>

              {/* Profile */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: profileOpen ? 'var(--navy-700)' : 'var(--navy-800)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    padding: '0.35rem 0.75rem 0.35rem 0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--orange-600), var(--orange-400))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 800,
                    fontSize: '0.8rem', color: 'white',
                    flexShrink: 0,
                  }}>
                    {(profile.display_name || profile.username)[0].toUpperCase()}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: '0.8rem', color: 'var(--charcoal-100)',
                  }} className="hide-mobile">
                    {profile.display_name || profile.username}
                  </span>
                  <span style={{ color: 'var(--charcoal-400)', fontSize: '0.65rem' }}>▾</span>
                </button>

                {profileOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                    width: 192,
                    background: 'var(--navy-800)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--r-xl)',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(4,12,30,0.8)',
                    zIndex: 100,
                  }}>
                    {[
                      { href: '/profile', label: 'My Profile', emoji: '👤' },
                      { href: '/create-player', label: 'New Player', emoji: '⚡' },
                      { href: '/settings', label: 'Settings', emoji: '⚙️' },
                    ].map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.65rem',
                          padding: '0.7rem 1rem',
                          fontFamily: 'var(--font-display)', fontWeight: 700,
                          fontSize: '0.85rem',
                          color: 'var(--charcoal-100)',
                          transition: 'all 0.15s',
                        }}
                        onClick={() => setProfileOpen(false)}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      >
                        <span>{item.emoji}</span> {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', margin: '0.25rem 0' }} />
                    <button
                      onClick={signOut}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.65rem',
                        padding: '0.7rem 1rem',
                        fontFamily: 'var(--font-display)', fontWeight: 700,
                        fontSize: '0.85rem',
                        color: '#fca5a5',
                        background: 'transparent',
                        border: 'none', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link href="/auth/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--charcoal-200)', padding: '0.4rem', display: 'none',
            }}
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 60, left: 0, right: 0,
          background: 'var(--navy-900)', borderBottom: '1px solid var(--border)',
          padding: '1rem',
        }}>
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--r-md)',
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '1rem', textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: isActive ? 'var(--accent)' : 'var(--charcoal-200)',
                  background: isActive ? 'rgba(249,115,22,0.1)' : 'transparent',
                  marginBottom: '0.25rem',
                }}
              >
                {label}
              </Link>
            )
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (max-width: 600px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
