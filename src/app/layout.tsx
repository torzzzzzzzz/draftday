import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: {
    default: 'Draft Day — Build Your Football Legacy',
    template: '%s | Draft Day',
  },
  description: 'Create your football player, build a legendary career from high school to the NFL Hall of Fame, compete with friends, and climb the leaderboards.',
  keywords: ['football', 'career simulator', 'NFL', 'player builder', 'sports game'],
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  openGraph: {
    type: 'website', title: 'Draft Day',
    description: 'Build your football legacy from high school to the Hall of Fame.',
    siteName: 'Draft Day',
  },
}

export const viewport: Viewport = {
  themeColor: '#05080f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
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
        <div className="app-shell">
          <Sidebar user={user} profile={profile} />
          <main className="main-content" style={{ paddingBottom: 80 }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
