'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Home, User, Trophy, ShoppingBag, Users, Target,
  Star, Settings, ChevronDown, LogOut, Zap, Menu, X
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/career', label: 'Career', icon: Trophy },
    { href: '/play', label: 'Play', icon: Zap },
    { href: '/leaderboards', label: 'Ranks', icon: Star },
    { href: '/friends', label: 'Friends', icon: Users },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-brand-500/20 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center">
            <span className="font-display font-900 text-xs text-white">DD</span>
          </div>
          <span className="font-display font-800 text-lg text-white tracking-wide hide-mobile">
            DRAFT DAY
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === href
                  ? 'bg-brand-500/20 text-brand-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/challenges"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              pathname === '/challenges' ? 'bg-brand-500/20 text-brand-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Challenges
          </Link>
          <Link
            href="/battle-pass"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              pathname === '/battle-pass' ? 'bg-brand-500/20 text-brand-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Battle Pass
          </Link>
          <Link
            href="/shop"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              pathname === '/shop' ? 'bg-brand-500/20 text-brand-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Shop
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user && profile ? (
            <>
              {/* Coins */}
              <div className="coin-badge hide-mobile">
                <span>🪙</span>
                <span>{profile.coins.toLocaleString()}</span>
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center text-xs font-bold text-white">
                    {(profile.display_name || profile.username)[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-300 hide-mobile">
                    {profile.display_name || profile.username}
                  </span>
                  <ChevronDown size={14} className="text-gray-500 hide-mobile" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 glass border border-brand-500/20 rounded-xl overflow-hidden shadow-2xl">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-all"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User size={15} />
                      My Profile
                    </Link>
                    <Link
                      href="/create-player"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-all"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Zap size={15} />
                      Create Player
                    </Link>
                    <Link
                      href="/shop"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-all"
                      onClick={() => setProfileOpen(false)}
                    >
                      <ShoppingBag size={15} />
                      Shop
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-all"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings size={15} />
                      Settings
                    </Link>
                    <div className="border-t border-white/5 mt-1" />
                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="btn btn-ghost text-sm px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="btn btn-primary text-sm px-4 py-2"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile full menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 glass-dark border-b border-brand-500/20 py-4 px-4 space-y-1">
          {[...navLinks,
            { href: '/challenges', label: 'Challenges', icon: Target },
            { href: '/battle-pass', label: 'Battle Pass', icon: Star },
            { href: '/shop', label: 'Shop', icon: ShoppingBag },
            { href: '/create-player', label: 'Create Player', icon: Zap },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname === href ? 'bg-brand-500/20 text-brand-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          {user && profile && (
            <div className="pt-2 border-t border-white/5">
              <div className="coin-badge ml-4 mb-2">
                <span>🪙</span>
                <span>{profile.coins.toLocaleString()} coins</span>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
