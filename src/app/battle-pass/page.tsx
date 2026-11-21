import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Battle Pass · Draft Day' }

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="6" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 6V4.5a3 3 0 016 0V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function RewardIcon({ type, rarity }: { type: string; rarity: string | null }) {
  const rarityColors: Record<string, string> = {
    common: '#9ca3af', uncommon: '#22c55e', rare: '#3b82f6',
    epic: '#a855f7', legendary: '#f59e0b',
  }
  const color = rarityColors[rarity ?? 'common'] ?? rarityColors.common

  const icons: Record<string, JSX.Element> = {
    coins: <circle cx="20" cy="20" r="13" stroke={color} strokeWidth="2"/>,
    helmet: <path d="M6 22C6 14 12.3 8 20 8s14 6 14 14v5H6v-5z" stroke={color} strokeWidth="2" fill="none"/>,
    xp_boost: <path d="M20 5l4 10h10l-8 6 3 10-9-6-9 6 3-10-8-6h10z" stroke={color} strokeWidth="2" fill="none"/>,
    avatar_frame: <rect x="6" y="6" width="28" height="28" rx="6" stroke={color} strokeWidth="2" fill="none"/>,
    title: <rect x="4" y="12" width="32" height="16" rx="4" stroke={color} strokeWidth="2" fill="none"/>,
    emote: <circle cx="20" cy="20" r="13" stroke={color} strokeWidth="2" fill="none"/>,
  }

  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill={`${color}15`}/>
      {icons[type] ?? icons.coins}
    </svg>
  )
}

export default async function BattlePassPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, tiersRes] = await Promise.all([
    supabase.from('profiles').select('battle_pass_tier, battle_pass_premium, xp, level').eq('id', user.id).single(),
    supabase.from('battle_pass_tiers').select('*').order('tier_number'),
  ])
  const profile = profileRes.data as {
    battle_pass_tier: number
    battle_pass_premium: boolean
    xp: number
    level: number
  } | null
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
  const xp = profile?.xp ?? 0
  const level = profile?.level ?? 1

  const XP_PER_TIER = 1000
  const tierXp = xp % XP_PER_TIER
  const tierXpPct = (tierXp / XP_PER_TIER) * 100

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--gold-400)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            SEASON 1 · 100 TIERS
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2.5rem,6vw,4rem)', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
            BATTLE PASS
          </h1>
          <p style={{ color: 'var(--charcoal-300)', marginTop: '0.5rem' }}>
            Earn XP to unlock exclusive rewards
          </p>
        </div>

        {!isPremium ? (
          <div className="card" style={{ padding: '1.25rem', border: '1px solid rgba(245,158,11,0.3)', textAlign: 'center', minWidth: 180 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--gold-400)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              PREMIUM
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', color: '#fff', lineHeight: 1 }}>
              950
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--gold-400)', marginBottom: '0.875rem' }}>coins</div>
            <form action="/api/battle-pass/upgrade" method="POST">
              <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '0.5rem 1rem' }}>
                Upgrade
              </button>
            </form>
            <div style={{ fontSize: '0.65rem', color: 'var(--charcoal-500)', marginTop: '0.5rem' }}>
              Unlock all premium rewards
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '1rem 1.5rem', border: '1px solid rgba(245,158,11,0.4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="rgba(245,158,11,0.15)"/>
              <path d="M8 16l5 5 11-10" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#f59e0b' }}>PREMIUM</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--charcoal-400)' }}>All rewards unlocked</div>
            </div>
          </div>
        )}
      </div>

      {/* Progress summary */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy-800) 0%, var(--navy-900) 100%)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: '1rem',
        padding: '1.5rem',
        marginBottom: '2rem',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '1.5rem',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff' }}>
              Tier {currentTier} Progress
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--charcoal-300)' }}>
              {tierXp.toLocaleString()} / {XP_PER_TIER.toLocaleString()} XP
            </span>
          </div>
          <div style={{ height: 10, background: 'var(--navy-700)', borderRadius: 999, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{
              height: '100%',
              width: `${tierXpPct}%`,
              background: 'linear-gradient(90deg, #f59e0b, #f97316)',
              borderRadius: 999,
              transition: 'width 0.5s ease',
              boxShadow: '0 0 8px rgba(249,115,22,0.5)',
            }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--charcoal-400)', marginTop: '0.5rem' }}>
            Level {level} · {currentTier} of 100 tiers complete
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', color: 'var(--gold-400)', lineHeight: 1 }}>
            {currentTier}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--charcoal-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Current Tier
          </div>
        </div>
      </div>

      {/* Tier track */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold-400)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Reward Track
        </div>
      </div>

      {tiers && tiers.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tiers.slice(0, 20).map((tier) => {
            const unlocked = currentTier >= tier.tier_number
            const isCurrent = currentTier + 1 === tier.tier_number

            return (
              <div key={tier.id} style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr 1fr',
                gap: '1rem',
                alignItems: 'center',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                background: isCurrent
                  ? 'rgba(245,158,11,0.08)'
                  : unlocked ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)',
                border: isCurrent
                  ? '1px solid rgba(245,158,11,0.3)'
                  : unlocked ? '1px solid rgba(34,197,94,0.15)' : '1px solid rgba(255,255,255,0.05)',
              }}>
                {/* Tier number */}
                <div style={{
                  width: 40, height: 40,
                  borderRadius: '50%',
                  background: unlocked
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : isCurrent ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'var(--navy-700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.85rem',
                  color: '#fff',
                  boxShadow: unlocked ? '0 0 10px rgba(34,197,94,0.3)' : isCurrent ? '0 0 10px rgba(245,158,11,0.4)' : 'none',
                }}>
                  {unlocked ? <CheckIcon /> : tier.tier_number}
                </div>

                {/* Free reward */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ opacity: unlocked ? 1 : 0.5 }}>
                    <RewardIcon type={tier.reward_type} rarity={tier.reward_rarity} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--charcoal-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                      FREE
                    </div>
                    <div style={{ fontSize: '0.85rem', color: unlocked ? '#fff' : 'var(--charcoal-500)', fontWeight: 600 }}>
                      {tier.free_reward ?? `${tier.reward_type} reward`}
                    </div>
                  </div>
                </div>

                {/* Premium reward */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: (unlocked && isPremium) ? 1 : 0.4 }}>
                  <div>
                    <RewardIcon type={tier.reward_type} rarity={tier.reward_rarity} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 2 }}>
                      <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        PREMIUM
                      </div>
                      {!isPremium && <div style={{ color: 'var(--charcoal-500)' }}><LockIcon /></div>}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: (unlocked && isPremium) ? 'var(--gold-300)' : 'var(--charcoal-500)', fontWeight: 600 }}>
                      {tier.premium_reward ?? `Premium ${tier.reward_type}`}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {tiers.length > 20 && (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--charcoal-500)', fontSize: '0.85rem' }}>
              + {tiers.length - 20} more tiers — keep earning XP to unlock
            </div>
          )}
        </div>
      ) : (
        /* Placeholder tier track */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((tierNum) => {
            const unlocked = currentTier >= tierNum
            const isCurrent = currentTier + 1 === tierNum

            const mockRewards = [
              { free: '500 Coins', premium: 'Rare Helmet', type: 'coins', rarity: 'common' },
              { free: 'XP Boost ×2', premium: 'Epic Visor', type: 'xp_boost', rarity: 'uncommon' },
              { free: '750 Coins', premium: 'Epic Title', type: 'coins', rarity: 'common' },
              { free: 'Common Frame', premium: 'Legendary Cleats', type: 'avatar_frame', rarity: 'rare' },
              { free: '1000 Coins', premium: 'Epic Emote', type: 'coins', rarity: 'common' },
              { free: 'XP Boost ×3', premium: 'Legendary Frame', type: 'xp_boost', rarity: 'rare' },
              { free: '1500 Coins', premium: 'Epic Gloves', type: 'coins', rarity: 'common' },
              { free: 'Rare Title', premium: 'Legendary Title', type: 'title', rarity: 'rare' },
              { free: '2000 Coins', premium: 'Legendary Helmet', type: 'coins', rarity: 'common' },
              { free: 'Epic Emote', premium: 'Season Champion Bundle', type: 'emote', rarity: 'epic' },
            ]
            const reward = mockRewards[(tierNum - 1) % mockRewards.length]

            return (
              <div key={tierNum} style={{
                display: 'grid', gridTemplateColumns: '48px 1fr 1fr', gap: '1rem', alignItems: 'center',
                padding: '0.875rem 1rem', borderRadius: '0.75rem',
                background: isCurrent ? 'rgba(245,158,11,0.08)' : unlocked ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)',
                border: isCurrent ? '1px solid rgba(245,158,11,0.3)' : unlocked ? '1px solid rgba(34,197,94,0.15)' : '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: unlocked ? 'linear-gradient(135deg, #22c55e, #16a34a)' : isCurrent ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'var(--navy-700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.85rem', color: '#fff',
                  boxShadow: unlocked ? '0 0 10px rgba(34,197,94,0.3)' : isCurrent ? '0 0 10px rgba(245,158,11,0.4)' : 'none',
                }}>
                  {unlocked ? <CheckIcon /> : tierNum}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: unlocked ? 1 : 0.6 }}>
                  <RewardIcon type={reward.type} rarity={reward.rarity} />
                  <div>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--charcoal-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>FREE</div>
                    <div style={{ fontSize: '0.85rem', color: unlocked ? '#fff' : 'var(--charcoal-500)', fontWeight: 600 }}>{reward.free}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: (unlocked && isPremium) ? 1 : 0.4 }}>
                  <RewardIcon type={reward.type} rarity="legendary" />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 2 }}>
                      <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>PREMIUM</div>
                      {!isPremium && <div style={{ color: 'var(--charcoal-500)' }}><LockIcon /></div>}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: (unlocked && isPremium) ? 'var(--gold-300)' : 'var(--charcoal-500)', fontWeight: 600 }}>{reward.premium}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* How to earn XP */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--navy-900)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: '1rem' }}>
          How to Earn XP
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Complete a Draft', xp: '+250 XP' },
            { label: 'Win a Game', xp: '+100 XP' },
            { label: 'Daily Challenge', xp: '+150 XP' },
            { label: 'Weekly Challenge', xp: '+500 XP' },
            { label: 'Season Challenge', xp: '+1000 XP' },
            { label: 'Login Bonus', xp: '+50 XP' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.625rem 0.875rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--charcoal-200)' }}>{item.label}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--orange-400)' }}>{item.xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
