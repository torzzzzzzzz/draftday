'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface SidebarProps {
  user: SupabaseUser | null
  profile: {
    username: string
    display_name: string | null
    coins: number
    level: number
    xp: number
    battle_pass_tier: number
  } | null
}

const NAV_ITEMS = [
  { href: '/',             label: 'Home',        icon: HomeIcon },
  { href: '/career',      label: 'Career',      icon: CareerIcon },
  { href: '/create-player', label: 'Create Player', icon: CreateIcon },
  { href: '/play',        label: 'Play',         icon: PlayIcon },
  { href: '/shop',        label: 'Shop',         icon: ShopIcon },
  { href: '/battle-pass', label: 'Battle Pass',  icon: BattlePassIcon },
  { href: '/friends',     label: 'Friends',      icon: FriendsIcon },
  { href: '/leaderboards', label: 'Leaderboards', icon: LeaderboardIcon },
  { href: '/challenges',  label: 'Challenges',   icon: ChallengesIcon },
  { href: '/settings',    label: 'Settings',     icon: SettingsIcon },
]

export function Sidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : profile?.username?.slice(0, 2).toUpperCase() || 'DD'

  return (
    <>
      {/* Mobile top bar */}
      <div style={{
        display: 'none',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 110,
        background: 'var(--navy-950)',
        borderBottom: '1px solid var(--border)',
        height: 56, alignItems: 'center',
        justifyContent: 'space-between', padding: '0 1rem',
      }} className="mobile-topbar">
        <DraftDayLogoInline />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {profile && (
            <div className="coin-badge" style={{ fontSize: '0.85rem', padding: '0.25rem 0.65rem' }}>
              <CoinSVG size={14} />
              {profile.coins.toLocaleString()}
            </div>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.4rem', color: 'var(--text-primary)', display: 'flex' }}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 108,
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
          <DraftDayLogoInline />
        </div>

        {/* Profile mini card */}
        {user && profile && (
          <Link href={`/profile/${profile.username}`} style={{ display: 'block', margin: '0.75rem', padding: '0.75rem', background: 'var(--navy-800)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', transition: 'border-color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div className="avatar avatar-sm" style={{ background: 'var(--orange-600)', color: '#fff', border: '1.5px solid rgba(249,115,22,0.4)' }}>
                {initials}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {profile.display_name || profile.username}
                </div>
                <div className="badge badge-gold" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                  LVL {profile.level}
                </div>
              </div>
            </div>
            {/* XP bar */}
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${Math.min(100, (profile.xp % 1000) / 10)}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              <span>{profile.xp % 1000} XP</span><span>1,000 XP</span>
            </div>
          </Link>
        )}

        {!user && (
          <div style={{ margin: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/auth/signup" className="btn btn-primary btn-sm btn-block">Create Account</Link>
            <Link href="/auth/login" className="btn btn-ghost btn-sm btn-block" style={{ fontSize: '0.8rem' }}>Sign In</Link>
          </div>
        )}

        {/* Coins */}
        {profile && (
          <div style={{ padding: '0 0.75rem 0.5rem' }}>
            <div className="coin-badge" style={{ width: '100%', justifyContent: 'center' }}>
              <CoinSVG size={16} />
              {profile.coins.toLocaleString()} coins
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0.5rem 0' }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  padding: '0.6rem 1rem', margin: '0.1rem 0.5rem',
                  borderRadius: 'var(--r-md)',
                  background: active ? 'rgba(249,115,22,0.12)' : 'transparent',
                  borderLeft: active ? '3px solid var(--orange-500)' : '3px solid transparent',
                  color: active ? 'var(--orange-400)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '0.9rem', letterSpacing: '0.03em',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}
              >
                <Icon size={16} active={active} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Premium CTA */}
        <div style={{ padding: '0.75rem' }}>
          <div className="premium-cta">
            <div style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>👑</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--gold-400)', marginBottom: '0.2rem', letterSpacing: '0.04em' }}>UPGRADE TO PREMIUM</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>Unlock rewards &amp; boost progress</div>
            <button className="btn btn-gold btn-sm btn-block">Go Premium →</button>
          </div>

          {user && (
            <button
              onClick={signOut}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}
            >
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {[
          { href: '/', label: 'Home', icon: HomeIcon },
          { href: '/career', label: 'Career', icon: CareerIcon },
          { href: '/play', label: 'Play', icon: PlayIcon, featured: true },
          { href: '/leaderboards', label: 'Ranks', icon: LeaderboardIcon },
          { href: '/challenges', label: 'Tasks', icon: ChallengesIcon },
        ].map(({ href, label, icon: Icon, featured }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          if (featured) {
            return (
              <Link key={href} href={href} className="mobile-nav-play" onClick={() => setMobileOpen(false)}>
                <div className="mobile-nav-play-btn"><PlayIcon size={22} active /></div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--orange-400)' }}>{label}</span>
              </Link>
            )
          }
          return (
            <Link key={href} href={href} className={`mobile-nav-item${active ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Icon size={20} active={active} />
              {label}
            </Link>
          )
        })}
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .mobile-topbar { display: flex !important; }
        }
      `}</style>
    </>
  )
}

/* ─── SVG ICONS ─── */

function DraftDayLogoInline() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      {/* Shield icon */}
      <svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 1L2 7v10c0 9.5 6 17.4 14 20 8-2.6 14-10.5 14-20V7L16 1z" fill="#0f1f3a" stroke="rgba(249,115,22,0.6)" strokeWidth="1.5"/>
        <path d="M16 1L2 7v10c0 9.5 6 17.4 14 20V1z" fill="rgba(249,115,22,0.08)"/>
        <text x="16" y="22" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="13" fill="#f97316">DD</text>
      </svg>
      <div>
        <div style={{ fontFamily: 'Barlow Condensed,sans-serif', fontWeight: 900, fontSize: '1.15rem', letterSpacing: '0.08em', lineHeight: 1 }}>
          <span style={{ color: '#f0ede8' }}>DRAFT </span>
          <span style={{ color: '#f97316' }}>DAY</span>
        </div>
        <div style={{ fontFamily: 'Barlow Condensed,sans-serif', fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.14em', color: '#4a5a72', textTransform: 'uppercase' }}>Football Career</div>
      </div>
    </div>
  )
}

function CoinSVG({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
      <text x="8" y="12" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="9" fill="#78350f">$</text>
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="2" rx="1" fill="currentColor"/>
      <rect x="2" y="9" width="16" height="2" rx="1" fill="currentColor"/>
      <rect x="2" y="14" width="16" height="2" rx="1" fill="currentColor"/>
    </svg>
  )
}

function HomeIcon({ size = 16, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 10.5L10 3l7 7.5V18H13v-4H7v4H3V10.5z" fill={active ? '#f97316' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

function CareerIcon({ size = 16, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill={active ? 'rgba(249,115,22,0.2)' : 'none'}/>
      <path d="M7 6V5a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 11h8M6 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function CreateIcon({ size = 16, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill={active ? 'rgba(249,115,22,0.15)' : 'none'}/>
      <path d="M10 6v8M6 10h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function PlayIcon({ size = 16, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill={active ? 'rgba(249,115,22,0.15)' : 'none'}/>
      <path d="M8 7l6 3-6 3V7z" fill="currentColor"/>
    </svg>
  )
}

function ShopIcon({ size = 16, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 4h2l2 8h8l2-6H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="17" r="1.5" fill="currentColor" opacity={active ? 1 : 0.6}/>
      <circle cx="15" cy="17" r="1.5" fill="currentColor" opacity={active ? 1 : 0.6}/>
    </svg>
  )
}

function BattlePassIcon({ size = 16, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2l2.4 4.9L18 7.6l-4 3.9.9 5.5L10 14.5l-4.9 2.5.9-5.5L2 7.6l5.6-.7L10 2z" fill={active ? 'rgba(249,115,22,0.2)' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

function FriendsIcon({ size = 16, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" fill={active ? 'rgba(249,115,22,0.15)' : 'none'}/>
      <path d="M2 18c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 8v5M17.5 10.5h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function LeaderboardIcon({ size = 16, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="1" y="12" width="4" height="7" rx="1" fill={active ? 'rgba(249,115,22,0.3)' : 'none'} stroke="currentColor" strokeWidth="1.5"/>
      <rect x="8" y="8" width="4" height="11" rx="1" fill={active ? 'rgba(249,115,22,0.5)' : 'none'} stroke="currentColor" strokeWidth="1.5"/>
      <rect x="15" y="4" width="4" height="15" rx="1" fill={active ? 'rgba(249,115,22,0.7)' : 'none'} stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function ChallengesIcon({ size = 16, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 5h12M4 10h8M4 15h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="16" cy="10" r="3" fill={active ? 'var(--orange-500)' : 'none'} stroke="currentColor" strokeWidth="1.5"/>
      <path d="M15 10l.8.8 1.4-1.6" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SettingsIcon({ size = 16, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" fill={active ? 'rgba(249,115,22,0.3)' : 'none'}/>
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
