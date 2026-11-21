import type { Metadata, Viewport } from 'next'
import './globals.css'
import { NavBar } from '@/components/layout/NavBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { NotificationBar } from '@/components/layout/NotificationBar'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: {
    default: 'Draft Day — Build Your Football Legacy',
    template: '%s | Draft Day',
  },
  description: 'Create your football player, build a legendary career from high school to the NFL Hall of Fame, compete with friends, and climb the leaderboards.',
  keywords: ['football', 'career simulator', 'NFL', 'player builder', 'sports game'],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    title: 'Draft Day',
    description: 'Build your football legacy from high school to the Hall of Fame.',
    siteName: 'Draft Day',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Draft Day',
    description: 'Build your football legacy from high school to the Hall of Fame.',
  },
}

export const viewport: Viewport = {
  themeColor: '#040c1e',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, coins, level, xp, battle_pass_tier')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <html lang="en">
      <body>
        <NavBar user={user} profile={profile} />
        <main style={{ minHeight: '100vh', paddingTop: 60 }}>
          {children}
        </main>
        <footer className="hidden md:block border-t border-white/5 py-6 mt-8">
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-xs text-gray-600">
            <span className="font-display font-700 text-gray-500">DRAFT DAY</span>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-gray-400 transition-colors">Terms</a>
              <a href="/leaderboards" className="hover:text-gray-400 transition-colors">Leaderboards</a>
            </div>
            <span>© {new Date().getFullYear()} Draft Day</span>
          </div>
        </footer>
        <BottomNav user={user} />
        {user && <NotificationBar userId={user.id} />}
      </body>
    </html>
  )
}
