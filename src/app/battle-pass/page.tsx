import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Battle Pass · Draft Day' }

const XP_PER_TIER = 1000
const TOTAL_TIERS = 50

type RewardType = 'coins' | 'xp_boost' | 'helmet' | 'emote' | 'avatar_frame' | 'title' | 'player_card'

interface MockReward {
  type: RewardType
  label: string
  value?: number
  rarity?: string
}

const FREE_REWARDS: (MockReward | null)[] = [
  { type: 'coins',       label: '500 Coins',      value: 500 },
  null,
  { type: 'xp_boost',   label: '+25% XP (1 day)', rarity: 'uncommon' },
  null,
  { type: 'avatar_frame', label: 'Bronze Frame',  rarity: 'uncommon' },
  null, null, null,
  { type: 'player_card', label: 'Rare Card Pack', rarity: 'rare' },
  null,
  { type: 'coins',       label: '1,000 Coins',   value: 1000 },
  null, null, null, null,
  { type: 'helmet',      label: 'All-Pro Lid',   rarity: 'rare' },
  null, null, null, null,
  { type: 'coins',       label: '1,500 Coins',   value: 1500 },
  null, null, null, null,
  { type: 'emote',       label: 'Spike Dance',   rarity: 'epic' },
  null, null, null, null,
  { type: 'coins',       label: '2,000 Coins',   value: 2000 },
  null, null, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  { type: 'player_card', label: 'Legendary Pack', rarity: 'legendary' },
]

const PREMIUM_REWARDS: (MockReward | null)[] = [
  { type: 'player_card', label: 'Card Pack',      rarity: 'uncommon' },
  { type: 'coins',       label: '800 Coins',      value: 800 },
  { type: 'avatar_frame', label: 'Silver Frame',  rarity: 'rare' },
  { type: 'xp_boost',   label: '+50% XP (3 day)', rarity: 'rare' },
  { type: 'emote',       label: 'Victory Lap',    rarity: 'rare' },
  { type: 'coins',       label: '1,200 Coins',    value: 1200 },
  { type: 'player_card', label: 'Rare Pack',      rarity: 'rare' },
  { type: 'helmet',      label: 'Chrome Visor',   rarity: 'epic' },
  { type: 'coins',       label: '1,500 Coins',    value: 1500 },
  { type: 'avatar_frame', label: 'Gold Frame',    rarity: 'epic' },
  { type: 'coins',       label: '2,000 Coins',    value: 2000 },
  { type: 'emote',       label: 'The Dab',        rarity: 'epic' },
  { type: 'player_card', label: 'Epic Pack',      rarity: 'epic' },
  { type: 'xp_boost',   label: '+100% XP (1 wk)', rarity: 'epic' },
  { type: 'coins',       label: '2,500 Coins',    value: 2500 },
  { type: 'helmet',      label: 'Elite Bucket',   rarity: 'legendary' },
  { type: 'coins',       label: '3,000 Coins',    value: 3000 },
  { type: 'player_card', label: 'Legendary Pack', rarity: 'legendary' },
  { type: 'avatar_frame', label: 'Diamond Frame', rarity: 'legendary' },
  { type: 'emote',       label: 'Hall of Fame',   rarity: 'legendary' },
  { type: 'coins',       label: '5,000 Coins',    value: 5000 },
  null, null, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null, null, null,
  null, null, null,
  { type: 'player_card', label: 'GOAT Card',      rarity: 'legendary' },
]

const RARITY_COLOR: Record<string, string> = {
  common:    '#9ca3af',
  uncommon:  '#22c55e',
  rare:      '#3b82f6',
  epic:      '#a855f7',
  legendary: '#f59e0b',
}

function RewardIcon({ reward, size = 32 }: { reward: MockReward; size?: number }) {
  const color = reward.rarity ? (RARITY_COLOR[reward.rarity] ?? '#9ca3af') : '#f59e0b'
  const s = size

  if (reward.type === 'coins') {
    return (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" fill={`${color}20`} stroke={color} strokeWidth="1.5"/>
        <text x="16" y="21" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="13" fill={color}>$</text>
      </svg>
    )
  }
  if (reward.type === 'xp_boost') {
    return (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 4L20 13L29 14L23 20L25 29L16 24L7 29L9 20L3 14L12 13Z" stroke={color} strokeWidth="1.5" fill={`${color}20`}/>
        <text x="16" y="20" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="8" fill={color}>XP</text>
      </svg>
    )
  }
  if (reward.type === 'player_card') {
    return (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="4" stroke={color} strokeWidth="1.5" fill={`${color}15`}/>
        <circle cx="16" cy="13" r="4" stroke={color} strokeWidth="1.2" fill={`${color}20`}/>
        <path d="M8 26c0-7 16-7 16 0" stroke={color} strokeWidth="1.2" fill="none"/>
      </svg>
    )
  }
  if (reward.type === 'helmet') {
    return (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M6 18C6 11.4 10.5 6 16 6s10 5.4 10 12v4H6v-4z" fill={`${color}25`} stroke={color} strokeWidth="1.3"/>
        <path d="M6 22h20M11 22v4a2 2 0 002 2h6a2 2 0 002-2v-4" stroke={`${color}70`} strokeWidth="1.2"/>
        <path d="M12 18 Q16 15 20 18" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    )
  }
  if (reward.type === 'emote') {
    return (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="11" stroke={color} strokeWidth="1.5" fill={`${color}15`}/>
        <path d="M11 20s2 3 5 3 5-3 5-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <circle cx="12" cy="14" r="1.5" fill={color}/>
        <circle cx="20" cy="14" r="1.5" fill={color}/>
      </svg>
    )
  }
  if (reward.type === 'avatar_frame') {
    return (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <rect x="3" y="3" width="26" height="26" rx="6" stroke={color} strokeWidth="1.5" fill={`${color}15`}/>
        <rect x="8" y="8" width="16" height="16" rx="3" stroke={`${color}50`} strokeWidth="1" strokeDasharray="4 2" fill="none"/>
      </svg>
    )
  }
  if (reward.type === 'title') {
    return (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <rect x="3" y="10" width="26" height="12" rx="4" stroke={color} strokeWidth="1.5" fill={`${color}15`}/>
        <text x="16" y="20" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="7" fill={color} letterSpacing="0.1em">TITLE</text>
      </svg>
    )
  }
  return null
}

export default async function BattlePassPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profileData } = await supabase
    .from('profiles').select('battle_pass_tier, battle_pass_premium, xp, level').eq('id', user.id).single()
  const profile = profileData as { battle_pass_tier: number; battle_pass_premium: boolean; xp: number; level: number } | null

  const currentTier = profile?.battle_pass_tier ?? 1
  const isPremium = profile?.battle_pass_premium ?? false
  const currentXp = profile?.xp ?? 0
  const tierXp = currentXp % XP_PER_TIER
  const tierXpPct = Math.min(100, (tierXp / XP_PER_TIER) * 100)
  const totalXp = (currentTier - 1) * XP_PER_TIER + tierXp

  const TIERS = Array.from({ length: TOTAL_TIERS }, (_, i) => i + 1)
  const DISPLAY_TIERS = TIERS.slice(0, 25) // show first 25

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-950)' }}>

      {/* SEASON BANNER */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #05080f 0%, #0a0f1e 40%, #0d0a1a 100%)',
        borderBottom: '1px solid rgba(249,115,22,0.15)',
        overflow: 'hidden',
        padding: '3rem 2rem 2rem',
      }}>
        {/* BG texture */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'repeating-linear-gradient(135deg, white 0, white 1px, transparent 1px, transparent 24px)' }}/>
        {/* Orange glow top-right */}
        <div style={{ position: 'absolute', top: '-60px', right: '0', width: '400px', height: '250px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        {/* Purple glow left */}
        <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '300px', height: '200px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '5px 14px', marginBottom: '14px',
                background: 'rgba(249,115,22,0.1)',
                border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: '6px',
              }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f97316', animation: 'pulse 2s infinite' }}/>
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.15em', color: '#f97316', textTransform: 'uppercase' }}>
                  SEASON 1 · GRIDIRON GLORY
                </span>
              </div>
              <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 'clamp(2.5rem,6vw,5rem)', lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'white', marginBottom: '8px' }}>
                BATTLE<br/>PASS
              </h1>
            </div>

            {/* Player Progress card */}
            <div style={{
              minWidth: '280px',
              padding: '18px 20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '28px', color: '#f97316', lineHeight: 1 }}>Tier {currentTier}</span>
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginLeft: '8px' }}>of {TOTAL_TIERS}</span>
                </div>
                <div style={{
                  padding: '5px 14px',
                  background: isPremium ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isPremium ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '8px',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 800, fontSize: '12px',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: isPremium ? '#f59e0b' : 'rgba(255,255,255,0.3)',
                }}>
                  {isPremium ? '⭐ PREMIUM' : 'FREE'}
                </div>
              </div>

              {/* XP bar */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>TIER XP</span>
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{tierXp.toLocaleString()} / {XP_PER_TIER.toLocaleString()}</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${tierXpPct}%`,
                    background: 'linear-gradient(90deg, #f97316, #f59e0b)',
                    borderRadius: '4px',
                    boxShadow: '0 0 8px rgba(249,115,22,0.5)',
                    transition: 'width 0.5s ease',
                  }}/>
                </div>
              </div>

              {!isPremium && (
                <button style={{
                  width: '100%', marginTop: '8px',
                  padding: '10px',
                  background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                  border: 'none', borderRadius: '10px',
                  color: '#05080f',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 900, fontSize: '14px',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
                }}>
                  UPGRADE TO PREMIUM — 2,500 Coins
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 2rem 4rem' }}>

        {/* COLUMN HEADERS */}
        <div style={{
          display: 'grid', gridTemplateColumns: '64px 1fr 1fr',
          gap: '8px', marginBottom: '8px', paddingLeft: '4px',
        }}>
          <div/>
          <div style={{
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '12px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)', textAlign: 'center',
          }}>FREE TRACK</div>
          <div style={{
            padding: '8px 12px',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '8px',
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '12px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: '#f59e0b', textAlign: 'center',
          }}>⭐ PREMIUM TRACK</div>
        </div>

        {/* TIER ROWS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {DISPLAY_TIERS.map((tier) => {
            const isCompleted = tier < currentTier
            const isCurrent = tier === currentTier
            const freeReward = FREE_REWARDS[tier - 1]
            const premReward = PREMIUM_REWARDS[tier - 1]

            return (
              <div key={tier} style={{
                display: 'grid', gridTemplateColumns: '64px 1fr 1fr',
                gap: '8px', alignItems: 'center',
                opacity: !isCompleted && !isCurrent ? 0.75 : 1,
              }}>
                {/* Tier number + connector */}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isCompleted
                      ? 'rgba(34,197,94,0.15)'
                      : isCurrent
                      ? 'rgba(249,115,22,0.15)'
                      : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${isCompleted ? 'rgba(34,197,94,0.5)' : isCurrent ? 'rgba(249,115,22,0.6)' : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: isCurrent ? '0 0 12px rgba(249,115,22,0.3)' : 'none',
                  }}>
                    {isCompleted ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M3 9l4 4 8-8" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '15px', color: isCurrent ? '#f97316' : 'rgba(255,255,255,0.4)', lineHeight: 1 }}>
                        {tier}
                      </span>
                    )}
                  </div>
                  {/* XP bar for current tier */}
                  {isCurrent && (
                    <div style={{ width: '2px', height: '100%', background: 'rgba(249,115,22,0.3)', borderRadius: '1px', minHeight: '8px' }}/>
                  )}
                </div>

                {/* Free reward */}
                <TierCell reward={freeReward} isCompleted={isCompleted} isCurrent={isCurrent} isPremium={false} userHasPremium={isPremium}/>

                {/* Premium reward */}
                <TierCell reward={premReward} isCompleted={isCompleted} isCurrent={isCurrent} isPremium={true} userHasPremium={isPremium}/>
              </div>
            )
          })}
        </div>

        {/* Show more teaser */}
        <div style={{
          marginTop: '16px', padding: '20px',
          background: 'linear-gradient(to bottom, rgba(5,8,15,0) 0%, rgba(5,8,15,0.8) 100%)',
          borderRadius: '12px', textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '14px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
            TIERS 26–50 UNLOCK AS YOU PROGRESS
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

function TierCell({
  reward, isCompleted, isCurrent, isPremium, userHasPremium
}: {
  reward: MockReward | null
  isCompleted: boolean
  isCurrent: boolean
  isPremium: boolean
  userHasPremium: boolean
}) {
  const isLocked = isPremium && !userHasPremium
  const hasReward = reward !== null

  if (!hasReward) {
    return (
      <div style={{
        height: '52px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: '20px', height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '1px' }}/>
      </div>
    )
  }

  const rarityColor = reward.rarity ? (RARITY_COLOR[reward.rarity] ?? '#9ca3af') : '#f59e0b'

  return (
    <div style={{
      height: '52px',
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '0 14px',
      background: isCompleted
        ? 'rgba(34,197,94,0.06)'
        : isCurrent
        ? isPremium
          ? 'rgba(245,158,11,0.08)'
          : 'rgba(249,115,22,0.08)'
        : isPremium
        ? 'rgba(245,158,11,0.04)'
        : 'rgba(255,255,255,0.03)',
      border: `1px solid ${
        isCompleted
          ? 'rgba(34,197,94,0.2)'
          : isCurrent
          ? isPremium ? 'rgba(245,158,11,0.3)' : 'rgba(249,115,22,0.3)'
          : isPremium ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.06)'
      }`,
      borderRadius: '10px',
      opacity: isLocked ? 0.5 : 1,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Rarity left accent */}
      {!isLocked && (
        <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '2px', borderRadius: '0 2px 2px 0', background: rarityColor, opacity: 0.7 }}/>
      )}

      {/* Icon */}
      <div style={{ flexShrink: 0 }}>
        {isLocked ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="3" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5"/>
            <path d="M8 11V7a4 4 0 018 0v4" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" fill="none"/>
          </svg>
        ) : (
          <RewardIcon reward={reward} size={28}/>
        )}
      </div>

      {/* Label */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px',
          color: isLocked ? 'rgba(255,255,255,0.3)' : isCompleted ? '#22c55e' : 'white',
          lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {reward.label}
        </div>
        {reward.rarity && !isLocked && (
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '10px',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: rarityColor, opacity: 0.8, marginTop: '2px',
          }}>
            {reward.rarity}
          </div>
        )}
        {isLocked && (
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '10px', letterSpacing: '0.08em', color: 'rgba(245,158,11,0.4)', marginTop: '2px' }}>
            PREMIUM
          </div>
        )}
      </div>

      {/* Completed check */}
      {isCompleted && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="8" cy="8" r="7" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.4)" strokeWidth="1"/>
          <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )}
    </div>
  )
}
