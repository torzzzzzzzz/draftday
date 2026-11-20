import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trophy, Zap, Users, Star, Target, ChevronRight, Award, TrendingUp } from 'lucide-react'
import { CareerOfTheWeek } from '@/components/leaderboard/CareerOfTheWeek'
import { DashboardPlayer } from '@/components/player/DashboardPlayer'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  let activeCareer = null
  let activePlayer = null
  let dailyChallenges: any[] = []
  let battlePassProgress = null

  if (user) {
    // Load profile
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = p as any

    // Load active career
    const { data: careersRaw } = await supabase
      .from('careers')
      .select(`*, players(*)`)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
    const careers = careersRaw as any[] | null

    if (careers && careers.length > 0) {
      activeCareer = careers[0]
      activePlayer = careers[0].players
    }

    // Load today's challenges
    const now = new Date().toISOString()
    const { data: challenges } = await supabase
      .from('challenges')
      .select(`*, challenge_progress(current_value, completed)`)
      .eq('challenge_type', 'daily')
      .eq('is_active', true)
      .lte('valid_from', now)
      .gte('valid_until', now)
      .limit(3)
    dailyChallenges = challenges || []

    // Battle pass info
    if (profile) {
      const { data: tier } = await supabase
        .from('battle_pass_tiers')
        .select('*')
        .eq('tier_number', (profile.battle_pass_tier || 0) + 1)
        .single()
      battlePassProgress = tier as any
    }
  }

  // HOF/leaderboard preview (always show)
  const { data: hofEntries } = await supabase
    .from('hall_of_fame')
    .select(`*, profiles(username, display_name)`)
    .order('inducted_at', { ascending: false })
    .limit(3)

  if (!user) {
    return <LandingPage />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-800 text-white">
            Welcome back, {profile?.display_name || profile?.username}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Level {profile?.level} · {profile?.xp?.toLocaleString()} XP
          </p>
        </div>
        <div className="coin-badge text-base px-4 py-2">
          <span>🪙</span>
          <span>{profile?.coins?.toLocaleString()}</span>
        </div>
      </div>

      {/* XP Bar */}
      {profile && battlePassProgress && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Level {profile.level} Progress</span>
            <span className="text-sm text-brand-400 font-medium">
              {profile.xp} / {battlePassProgress.xp_required} XP
            </span>
          </div>
          <div className="xp-bar">
            <div
              className="xp-bar-fill"
              style={{ width: `${Math.min(100, (profile.xp / battlePassProgress.xp_required) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active player card */}
          {activePlayer && activeCareer ? (
            <DashboardPlayer player={activePlayer} career={activeCareer} />
          ) : (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                <Zap size={28} className="text-brand-400" />
              </div>
              <h2 className="text-xl font-display font-700 text-white mb-2">Start Your Career</h2>
              <p className="text-gray-400 text-sm mb-6">
                Create your player and begin your journey from high school to the NFL Hall of Fame.
              </p>
              <Link href="/create-player" className="btn btn-primary">
                Create Your Player
              </Link>
            </div>
          )}

          {/* Daily Challenges */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-brand-400" />
                <h2 className="font-display font-700 text-white text-lg">Daily Challenges</h2>
              </div>
              <Link href="/challenges" className="text-brand-400 text-sm flex items-center gap-1 hover:text-brand-300">
                See all <ChevronRight size={14} />
              </Link>
            </div>
            {dailyChallenges.length > 0 ? (
              <div className="divide-y divide-white/5">
                {dailyChallenges.map((c: any) => {
                  const progress = c.challenge_progress?.[0]
                  const pct = progress ? Math.min(100, (progress.current_value / c.objective_target) * 100) : 0
                  return (
                    <div key={c.id} className="px-5 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{c.title}</span>
                        <div className="flex items-center gap-2">
                          {progress?.completed && (
                            <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">Done</span>
                          )}
                          <span className="text-xs text-gray-500">{c.coin_reward}🪙</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{c.description}</p>
                      <div className="flex items-center gap-3">
                        <div className="stat-bar flex-1">
                          <div
                            className="stat-bar-fill"
                            style={{
                              width: `${pct}%`,
                              background: progress?.completed
                                ? 'linear-gradient(90deg, #25a56e, #48c18a)'
                                : 'linear-gradient(90deg, #188557, #25a56e)'
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {progress?.current_value || 0}/{c.objective_target}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-5 py-6 text-center text-gray-500 text-sm">
                No challenges available today. Check back soon!
              </div>
            )}
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/play', label: 'Play Game', icon: Zap, color: 'from-brand-600 to-brand-500' },
              { href: '/career', label: 'My Career', icon: Trophy, color: 'from-amber-700 to-amber-500' },
              { href: '/friends', label: 'Friends', icon: Users, color: 'from-blue-700 to-blue-500' },
              { href: '/shop', label: 'Shop', icon: Star, color: 'from-purple-700 to-purple-500' },
            ].map(({ href, label, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className={`card card-hover p-4 flex flex-col items-center gap-2 text-center`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon size={18} className="text-white" />
                </div>
                <span className="text-xs font-medium text-gray-300">{label}</span>
              </Link>
            ))}
          </div>

          {/* Battle Pass */}
          {profile && (
            <div className="card overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-amber-900/40 to-amber-800/20 border-b border-amber-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-400 font-medium">Battle Pass · Season 1</p>
                    <p className="text-white font-display font-700 text-lg mt-0.5">
                      Tier {profile.battle_pass_tier}
                    </p>
                  </div>
                  <TrendingUp size={24} className="text-amber-400" />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Progress to Tier {(profile.battle_pass_tier || 0) + 1}</span>
                  {!profile.battle_pass_premium && (
                    <Link href="/battle-pass" className="text-xs text-amber-400 hover:text-amber-300">
                      Go Premium
                    </Link>
                  )}
                </div>
                <div className="stat-bar">
                  <div className="stat-bar-fill" style={{
                    width: battlePassProgress
                      ? `${Math.min(100, (profile.xp / battlePassProgress.xp_required) * 100)}%`
                      : '0%',
                    background: 'linear-gradient(90deg, #d97706, #f59e0b)'
                  }} />
                </div>
                <Link href="/battle-pass" className="btn btn-secondary w-full mt-3 text-sm">
                  View Battle Pass
                </Link>
              </div>
            </div>
          )}

          {/* Career of the Week preview */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-gold-400" />
                <h2 className="font-display font-700 text-white text-lg">Top Careers</h2>
              </div>
              <Link href="/leaderboards" className="text-brand-400 text-sm flex items-center gap-1 hover:text-brand-300">
                Full board <ChevronRight size={14} />
              </Link>
            </div>
            <CareerOfTheWeek preview />
          </div>
        </div>
      </div>
    </div>
  )
}

function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-field-gradient" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(ellipse at 50% 60%, rgba(37,165,110,0.15) 0%, transparent 70%)`,
        }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(37,165,110,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(37,165,110,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-2 mb-6">
            <span className="text-brand-400 text-sm font-medium">🏈 Football Career Simulator</span>
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-900 text-white mb-4 leading-none tracking-tight">
            YOUR <span className="text-gradient-brand">LEGACY</span>
            <br />STARTS HERE
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Create your player. Build a career from Friday night lights to the Hall of Fame.
            Compete with friends. Write your legend.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn btn-primary text-lg px-8 py-4">
              Start Your Career
            </Link>
            <Link href="/auth/login" className="btn btn-ghost text-lg px-8 py-4">
              Sign In
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 text-center">
            {[
              { value: '12', label: 'Positions' },
              { value: '100', label: 'Battle Pass Tiers' },
              { value: '32', label: 'NFL Teams' },
              { value: '∞', label: 'Career Paths' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-display font-900 text-gradient-brand">{value}</div>
                <div className="text-gray-500 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-brand-500/40 flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-brand-400" />
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl font-800 text-white mb-4">EVERYTHING YOU NEED</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            From player creation to Hall of Fame induction — the most complete football career experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: '🎮',
              title: 'Create Your Player',
              desc: 'Customize every detail — position, appearance, equipment, celebrations. All 12 positions with position-specific attributes.',
              color: 'from-brand-600/20 to-brand-500/10',
              border: 'border-brand-500/20',
            },
            {
              icon: '🏈',
              title: 'Career Story Mode',
              desc: 'Start in high school, earn a college scholarship, get drafted into the NFL, and chase Super Bowl rings and Hall of Fame glory.',
              color: 'from-amber-900/20 to-amber-800/10',
              border: 'border-amber-500/20',
            },
            {
              icon: '📊',
              title: 'Real Statistics',
              desc: 'Position-specific stats that actually reflect your gameplay. Season stats, career records, personal bests, and awards.',
              color: 'from-blue-900/20 to-blue-800/10',
              border: 'border-blue-500/20',
            },
            {
              icon: '👥',
              title: 'Friends & Multiplayer',
              desc: 'Add friends, compare careers, and compete head-to-head. See who has the best career in your friend group.',
              color: 'from-purple-900/20 to-purple-800/10',
              border: 'border-purple-500/20',
            },
            {
              icon: '🏆',
              title: 'Battle Pass & Rewards',
              desc: '100 tiers of unlockable content — helmets, uniforms, celebrations, and exclusive cosmetics. Free and premium tracks.',
              color: 'from-amber-900/20 to-orange-800/10',
              border: 'border-orange-500/20',
            },
            {
              icon: '🌟',
              title: 'Career of the Week',
              desc: 'Weekly leaderboard showcasing the top 3 careers. Climb the ranks through real performance and achievements.',
              color: 'from-brand-900/20 to-brand-800/10',
              border: 'border-brand-500/20',
            },
          ].map(({ icon, title, desc, color, border }) => (
            <div key={title} className={`card card-hover p-6 bg-gradient-to-br ${color} border ${border}`}>
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="font-display font-700 text-xl text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent" />
          <div className="relative z-10">
            <h2 className="font-display text-5xl font-800 text-white mb-4">READY TO BE LEGENDARY?</h2>
            <p className="text-gray-400 mb-8">
              Your career won't build itself. Every great player started somewhere — start here.
            </p>
            <Link href="/auth/signup" className="btn btn-primary text-lg px-10 py-4">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center">
              <span className="font-display font-900 text-xs text-white">DD</span>
            </div>
            <span className="font-display font-800 text-white">DRAFT DAY</span>
          </div>
          <p className="text-gray-600 text-sm text-center">
            Draft Day is a fan-made football career simulator. Not affiliated with the NFL, NFLPA, NCAA, or any team.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-300">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-300">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
