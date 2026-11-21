import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Shop · Draft Day' }

const RARITY: Record<string, { label: string; color: string; bg: string; glow: string }> = {
  common:    { label: 'COMMON',    color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', glow: 'rgba(156,163,175,0)' },
  uncommon:  { label: 'UNCOMMON',  color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   glow: 'rgba(34,197,94,0.15)' },
  rare:      { label: 'RARE',      color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  glow: 'rgba(59,130,246,0.15)' },
  epic:      { label: 'EPIC',      color: '#a855f7', bg: 'rgba(168,85,247,0.1)',  glow: 'rgba(168,85,247,0.15)' },
  legendary: { label: 'LEGENDARY', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', glow: 'rgba(245,158,11,0.2)' },
}

function ItemIcon({ type }: { type: string }) {
  const icons: Record<string, JSX.Element> = {
    helmet: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <ellipse cx="20" cy="22" rx="14" ry="12" fill="currentColor" opacity="0.15"/>
        <path d="M6 22C6 14.3 12.3 8 20 8s14 6.3 14 14v4H6v-4z" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M6 26h28M14 26v4a2 2 0 002 2h8a2 2 0 002-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <rect x="16" y="20" width="12" height="3" rx="1" fill="currentColor" opacity="0.5"/>
      </svg>
    ),
    gloves: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M12 28V16a3 3 0 016 0v6M18 18V14a3 3 0 016 0v4M24 16V14a3 3 0 016 0v10c0 5.5-4.5 10-10 10h-2a8 8 0 01-8-8v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    cleats: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M8 32h24M10 32V20c0-5.5 4.5-10 10-10h4c3.3 0 6 2.7 6 6v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 32v4M20 32v4M26 32v4M20 22l-6 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    avatar_frame: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="4" width="32" height="32" rx="8" stroke="currentColor" strokeWidth="2.5" fill="none"/>
        <rect x="8" y="8" width="24" height="24" rx="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" fill="none" opacity="0.5"/>
        <circle cx="20" cy="17" r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M11 32c0-5 4-8 9-8s9 3 9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="12" width="32" height="16" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M12 20h16M12 24h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
    emote: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M14 24s2 4 6 4 6-4 6-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="15" cy="17" r="2" fill="currentColor"/>
        <circle cx="25" cy="17" r="2" fill="currentColor"/>
      </svg>
    ),
    equipment: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <ellipse cx="20" cy="20" rx="12" ry="8" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M8 20h24M20 12v16M14 14l12 12M26 14L14 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
    coins: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="13" fill="currentColor" opacity="0.15"/>
        <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="2" fill="none"/>
        <text x="20" y="25" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="bold">$</text>
      </svg>
    ),
  }
  return <div style={{ color: 'var(--charcoal-200)' }}>{icons[type] ?? icons.equipment}</div>
}

export default async function ShopPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, dailyShopRes] = await Promise.all([
    supabase.from('profiles').select('coins').eq('id', user.id).single(),
    supabase.from('daily_shop').select(`*, shop_items(*)`).eq('date', new Date().toISOString().slice(0, 10)).limit(8),
  ])
  const profile = profileRes.data as { coins: number } | null
  const dailyShop = dailyShopRes.data as any[] | null
  const coins = profile?.coins ?? 0

  const { data: ownedRaw } = await supabase.from('purchases').select('item_id').eq('user_id', user.id)
  const owned = ownedRaw as any[] | null
  const ownedIds = new Set(owned?.map((p: any) => p.item_id) ?? [])

  // Mock featured item if no shop data
  const featuredItem = dailyShop?.[0]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--orange-400)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            DAILY ROTATION
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2.5rem,6vw,4rem)', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
            SHOP
          </h1>
          <p style={{ color: 'var(--charcoal-300)', marginTop: '0.5rem' }}>
            Items refresh daily at midnight
          </p>
        </div>
        {/* Coin balance */}
        <div className="card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(245,158,11,0.3)' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" fill="rgba(245,158,11,0.15)"/>
            <circle cx="14" cy="14" r="12" stroke="#f59e0b" strokeWidth="1.5"/>
            <text x="14" y="19" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">$</text>
          </svg>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.5rem', color: '#f59e0b', lineHeight: 1 }}>
              {coins.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--charcoal-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Coins
            </div>
          </div>
        </div>
      </div>

      {/* Featured banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy-800) 0%, var(--navy-900) 60%, rgba(249,115,22,0.08) 100%)',
        border: '1px solid rgba(249,115,22,0.2)',
        borderRadius: '1rem',
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', right: -20, top: -20,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          width: 100, height: 100, borderRadius: '1rem',
          background: 'var(--navy-700)',
          border: '1px solid rgba(249,115,22,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 30px rgba(249,115,22,0.15)',
        }}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <ellipse cx="30" cy="33" rx="20" ry="15" fill="rgba(249,115,22,0.1)"/>
            <path d="M10 33C10 22 19.3 13 30 13s20 9.3 20 20v6H10v-6z" stroke="#f97316" strokeWidth="2.5" fill="none"/>
            <path d="M10 39h40M20 39v5a2 2 0 002 2h16a2 2 0 002-2v-5" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
            <rect x="22" y="30" width="16" height="4" rx="1.5" fill="#f97316" opacity="0.4"/>
            <path d="M30 13V8M24 10l6 3 6-3" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gold-400)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            FEATURED · LEGENDARY
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>
            Elite Gold Helmet
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--charcoal-300)', marginBottom: '1rem' }}>
            Exclusive championship-grade equipment with custom finish. Worn by legends.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', color: '#f59e0b' }}>
              2,400
              <span style={{ fontSize: '0.9rem', color: '#f59e0b', marginLeft: 4 }}>coins</span>
            </div>
            <form action="/api/purchase" method="POST">
              <button type="submit" className="btn btn-gold" style={{ padding: '0.6rem 1.5rem' }}>
                Purchase
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Daily items grid */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--orange-400)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Today&apos;s Items
        </div>
      </div>

      {dailyShop && dailyShop.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {dailyShop.map((entry: any) => {
            const item = entry.shop_items as any
            if (!item) return null
            const rarity = RARITY[item.rarity] ?? RARITY.common
            const isOwned = ownedIds.has(item.id)

            return (
              <div key={entry.id} style={{
                background: 'var(--navy-900)',
                border: `1px solid ${isOwned ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                borderRadius: '0.875rem',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }} className="shop-item">
                {/* Item preview */}
                <div style={{
                  height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `linear-gradient(135deg, ${rarity.bg} 0%, var(--navy-800) 100%)`,
                  color: rarity.color,
                  borderBottom: `1px solid var(--border)`,
                  position: 'relative',
                }}>
                  <ItemIcon type={item.type} />
                  <div style={{
                    position: 'absolute', top: '0.5rem', left: '0.5rem',
                    fontSize: '0.6rem', fontFamily: 'var(--font-display)', fontWeight: 700,
                    color: rarity.color, background: rarity.bg,
                    padding: '0.2rem 0.5rem', borderRadius: '0.25rem',
                    letterSpacing: '0.08em', border: `1px solid ${rarity.color}40`,
                  }}>
                    {rarity.label}
                  </div>
                  {isOwned && (
                    <div style={{
                      position: 'absolute', top: '0.5rem', right: '0.5rem',
                      background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)',
                      borderRadius: '0.25rem', padding: '0.2rem 0.5rem',
                      fontSize: '0.6rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#22c55e', letterSpacing: '0.08em',
                    }}>
                      OWNED
                    </div>
                  )}
                </div>

                {/* Item info */}
                <div style={{ padding: '0.875rem' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: '0.25rem' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--charcoal-400)', marginBottom: '0.875rem', textTransform: 'capitalize' }}>
                    {item.type?.replace('_', ' ')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: '#f59e0b' }}>
                      {item.price} <span style={{ fontSize: '0.65rem', color: 'var(--charcoal-400)' }}>coins</span>
                    </div>
                    {isOwned ? (
                      <div style={{ fontSize: '0.75rem', color: '#22c55e', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                        ✓ Equipped
                      </div>
                    ) : (
                      <form action="/api/purchase" method="POST">
                        <input type="hidden" name="item_id" value={item.id} />
                        <button
                          type="submit"
                          className="btn btn-outline"
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                          disabled={coins < item.price}
                        >
                          Buy
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty state with placeholder cards */
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'Carbon Visor', type: 'visor', rarity: 'rare', price: 800 },
              { name: 'Speed Cleats', type: 'cleats', rarity: 'uncommon', price: 400 },
              { name: 'Pro Gloves', type: 'gloves', rarity: 'common', price: 200 },
              { name: 'Victory Emote', type: 'emote', rarity: 'epic', price: 1200 },
              { name: 'Gold Frame', type: 'avatar_frame', rarity: 'legendary', price: 2000 },
              { name: 'Elite Title', type: 'title', rarity: 'rare', price: 600 },
            ].map((item, i) => {
              const rarity = RARITY[item.rarity]
              return (
                <div key={i} style={{
                  background: 'var(--navy-900)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.875rem',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `linear-gradient(135deg, ${rarity.bg} 0%, var(--navy-800) 100%)`,
                    color: rarity.color,
                    borderBottom: '1px solid var(--border)',
                    position: 'relative',
                  }}>
                    <ItemIcon type={item.type} />
                    <div style={{
                      position: 'absolute', top: '0.5rem', left: '0.5rem',
                      fontSize: '0.6rem', fontFamily: 'var(--font-display)', fontWeight: 700,
                      color: rarity.color, background: rarity.bg,
                      padding: '0.2rem 0.5rem', borderRadius: '0.25rem',
                      letterSpacing: '0.08em', border: `1px solid ${rarity.color}40`,
                    }}>
                      {rarity.label}
                    </div>
                  </div>
                  <div style={{ padding: '0.875rem' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: '0.25rem' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--charcoal-400)', marginBottom: '0.875rem', textTransform: 'capitalize' }}>
                      {item.type.replace('_', ' ')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: '#f59e0b' }}>
                        {item.price} <span style={{ fontSize: '0.65rem', color: 'var(--charcoal-400)' }}>coins</span>
                      </div>
                      <button className="btn btn-outline" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}>
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <p style={{ textAlign: 'center', color: 'var(--charcoal-500)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
            Shop inventory resets every day. Check back tomorrow for new items.
          </p>
        </div>
      )}
    </div>
  )
}
