'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, Zap, Star, User, ShoppingBag } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface BottomNavProps {
  user: SupabaseUser | null
}

export function BottomNav({ user }: BottomNavProps) {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/career', label: 'Career', icon: Trophy },
    { href: '/play', label: 'Play', icon: Zap, highlight: true },
    { href: '/leaderboards', label: 'Ranks', icon: Star },
    { href: user ? '/profile' : '/auth/login', label: user ? 'Profile' : 'Sign In', icon: User },
  ]

  return (
    <div className="bottom-nav md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map(({ href, label, icon: Icon, highlight }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                highlight
                  ? active
                    ? 'bg-brand-500/30 text-brand-400'
                    : 'bg-brand-500/15 text-brand-400'
                  : active
                    ? 'text-brand-400'
                    : 'text-gray-500'
              }`}
            >
              {highlight ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/30 -mt-5">
                  <Icon size={18} className="text-white" />
                </div>
              ) : (
                <Icon size={20} />
              )}
              <span className={`text-xs font-medium ${highlight ? 'mt-1' : ''}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
