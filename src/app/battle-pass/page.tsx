import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Lock, CheckCircle, Star, Zap } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Battle Pass' }

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}

export default async function BattlePassPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, tiersRes] = await Promise.all([
    supabase.from('profiles').select('battle_pass_tier, battle_pass_premium, xp, level').eq('id', user.id).single(),
    supabase.from('battle_pass_tiers').select('*').order('tier_number'),
  ])
  const profile = profileRes.data as { battle_pass_tier: number; battle_pass_premium: boolean; xp: number; level: number } | null
  const tiers = tiersRes.data as Array<{
    id: string
    tier_number: number
    is_premium: boolean
    reward_type: string
    reward_rarity: string | null
    free_reward: string | null
    premium_reward: string | null
  }> | null

  const currentTier = profile?.battle_pass_tier ?? 0
  const isPremium = profile?.battle_pass_premium ?? false

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-brand-400 font-display font-700 tracking-widest mb-1">SEASON 1</div>
            <h1 className="font-display text-5xl font-800 text-white">BATTLE PASS</h1>
            <p className="text-gray-400 mt-1">Earn XP to unlock rewards across 100 tiers</p>
          </div>

          {!isPremium && (
            <div className="card border border-amber-500/30 p-4 text-center">
              <div className="text-amber-400 font-display font-800 text-lg">PREMIUM</div>
              <div className="text-3xl font-display font-900 text-white my-1">950 <span className="text-sm text-amber-400">coins</span></div>
              <button className="btn btn-gold text-sm px-4 py-2 w-full mt-1">
                Upgrade
              </button>
            </div>
          )}
          {isPremium && (
            <div className="card border border-amber-500/30 p-4 text-center">
              <div className="text-amber-400 font-display font-800">✓ PREMIUM</div>
              <div className="text-xs text-gray-400 mt-1">All rewards unlocked</div>
            </div>
          )}
        </div>

        {/* Progress overview */}
        <div className="card p-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Tier Progress</span>
            <span className="font-display font-800 text-white">{currentTier} <span className="text-gray-500">/ 100</span></span>
          </div>
          <div className="stat-bar h-3 rounded-full">
            <div
              className="stat-bar-fill rounded-full"
              style={{
                width: `${currentTier}%`,
                background: 'linear-gradient(90deg, #25a56e, #48c18a)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Tier grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {tiers?.map((tier) => {
          const isUnlocked = tier.tier_number <= currentTier
          const isCurrent = tier.tier_number === currentTier + 1
          const reward = isUnlocked || isPremium
            ? (tier.premium_reward ?? tier.free_reward)
            : (tier.is_premium ? null : tier.free_reward)
          const isPremiumTier = tier.is_premium
          const color = RARITY_COLORS[tier.reward_rarity ?? 'common']

          return (
            <div
              key={tier.id}
              className={`relative rounded-xl border p-2 text-center transition-all ${
                isCurrent
                  ? 'border-brand-500 bg-brand-500/10 scale-105 z-10'
                  : isUnlocked
                  ? 'border-brand-500/20 bg-brand-500/5'
                  : 'border-white/5 bg-white/2 opacity-60'
              }`}
            >
              {/* Tier number */}
              <div className={`text-xs font-display font-800 mb-1 ${
                isCurrent ? 'text-brand-400' : isUnlocked ? 'text-brand-500/70' : 'text-gray-600'
              }`}>
                {tier.tier_number}
              </div>

              {/* Reward icon */}
              <div className="text-lg" style={{ filter: isUnlocked ? 'none' : 'grayscale(1)' }}>
                {tier.reward_type === 'coins' ? '🪙' :
                 tier.reward_type === 'xp' ? '⚡' :
                 tier.reward_type === 'title' ? '🏷️' :
                 tier.reward_type === 'avatar_frame' ? '🖼️' :
                 tier.reward_type === 'emote' ? '🎭' :
                 tier.reward_type === 'equipment' ? '🏈' : '🎁'}
              </div>

              {/* Premium lock */}
              {isPremiumTier && !isPremium && !isUnlocked && (
                <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/40">
                  <Lock size={12} className="text-amber-500/60" />
                </div>
              )}

              {/* Completed check */}
              {isUnlocked && (
                <div className="absolute top-1 right-1">
                  <CheckCircle size={10} className="text-brand-500" />
                </div>
              )}

              {/* Premium gem */}
              {isPremiumTier && (
                <div className="absolute top-1 left-1">
                  <Star size={8} className="text-amber-500" />
                </div>
              )}

              {/* Reward rarity dot */}
              <div
                className="w-1.5 h-1.5 rounded-full mx-auto mt-1"
                style={{ background: isUnlocked ? color : '#374151' }}
              />
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><Star size={10} className="text-amber-500" /> Premium reward</div>
        <div className="flex items-center gap-1.5"><CheckCircle size={10} className="text-brand-500" /> Unlocked</div>
        {Object.entries(RARITY_COLORS).map(([rarity, color]) => (
          <div key={rarity} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="capitalize">{rarity}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
