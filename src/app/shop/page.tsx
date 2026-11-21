import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Shop · Draft Day' }

const RARITY: Record<string, { label: string; color: string; bg: string; glow: string; border: string }> = {
  common:    { label: 'COMMON',    color: '#9ca3af', bg: 'rgba(156,163,175,0.08)', glow: 'rgba(156,163,175,0)',   border: 'rgba(156,163,175,0.2)' },
  uncommon:  { label: 'UNCOMMON',  color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   glow: 'rgba(34,197,94,0.2)',   border: 'rgba(34,197,94,0.25)' },
  rare:      { label: 'RARE',      color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  glow: 'rgba(59,130,246,0.2)',  border: 'rgba(59,130,246,0.3)' },
  epic:      { label: 'EPIC',      color: '#a855f7', bg: 'rgba(168,85,247,0.08)',  glow: 'rgba(168,85,247,0.25)', border: 'rgba(168,85,247,0.35)' },
  legendary: { label: 'LEGENDARY', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', glow: 'rgba(245,158,11,0.3)',  border: 'rgba(245,158,11,0.4)' },
}

function HelmetSVG({ color = '#f97316' }: { color?: string }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="44" rx="28" ry="22" fill={`${color}18`}/>
      <path d="M12 44C12 28.5 24.5 16 40 16s28 12.5 28 28v8H12v-8z" fill={color} opacity="0.9"/>
      <path d="M12 52h56M24 52v8a4 4 0 004 4h24a4 4 0 004-4v-8" stroke={`${color}88`} strokeWidth="2" strokeLinecap="round"/>
      <rect x="28" y="40" width="24" height="6" rx="2" fill="rgba(0,0,0,0.3)"/>
      <path d="M20 44 Q40 36 60 44" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="40" cy="34" r="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
      <text x="40" y="38" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="7" fill="rgba(255,255,255,0.8)">DD</text>
    </svg>
  )
}

function GlovesSVG({ color = '#3b82f6' }: { color?: string }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <path d="M24 56V32a6 6 0 0112 0v12M36 36V28a6 6 0 0112 0v8M48 32V28a6 6 0 0112 0v20c0 11-9 20-20 20h-4a16 16 0 01-16-16V44" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M24 44h32" stroke={`${color}50`} strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="28" cy="56" rx="6" ry="4" fill={`${color}20`}/>
    </svg>
  )
}

function CleatsSVG({ color = '#22c55e' }: { color?: string }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <path d="M16 64h48M20 64V40c0-11 9-20 20-20h8c6.6 0 12 5.4 12 12v32" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M28 64v8M40 64v8M52 64v8" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <path d="M40 44L28 64" stroke={`${color}50`} strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="40" cy="40" rx="8" ry="4" fill={`${color}20`}/>
    </svg>
  )
}

function FrameSVG({ color = '#a855f7' }: { color?: string }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="8" y="8" width="64" height="64" rx="12" stroke={color} strokeWidth="3" fill={`${color}10`}/>
      <rect x="16" y="16" width="48" height="48" rx="8" stroke={`${color}50`} strokeWidth="1.5" strokeDasharray="6 3" fill="none"/>
      <circle cx="40" cy="34" r="10" stroke={color} strokeWidth="2" fill={`${color}15`}/>
      <path d="M22 64c0-10 8-16 18-16s18 6 18 16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function TitleSVG({ color = '#f59e0b' }: { color?: string }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="8" y="24" width="64" height="32" rx="8" stroke={color} strokeWidth="2.5" fill={`${color}10`}/>
      <text x="40" y="38" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="10" fill={color} letterSpacing="0.1em">HALL OF FAME</text>
      <text x="40" y="50" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="700" fontSize="8" fill={`${color}80`} letterSpacing="0.06em">PLAYER TITLE</text>
      <path d="M16 24L8 16M64 24L72 16" stroke={`${color}40`} strokeWidth="2"/>
      <path d="M20 56L12 68M60 56L68 68" stroke={`${color}40`} strokeWidth="2"/>
    </svg>
  )
}

function EmoteSVG({ color = '#ec4899' }: { color?: string }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="26" stroke={color} strokeWidth="2.5" fill={`${color}10`}/>
      <path d="M28 48s4 8 12 8 12-8 12-8" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="30" cy="34" r="4" fill={color}/>
      <circle cx="50" cy="34" r="4" fill={color}/>
      <path d="M20 20L12 12M60 20L68 12M20 60L12 68M60 60L68 68" stroke={`${color}40`} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

function CoinsSVG({ color = '#f59e0b' }: { color?: string }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="36" cy="44" r="20" fill={`${color}20`} stroke={color} strokeWidth="2.5"/>
      <text x="36" y="50" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="18" fill={color}>$</text>
      <circle cx="52" cy="32" r="14" fill={`${color}15`} stroke={`${color}80`} strokeWidth="2"/>
      <text x="52" y="37" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="13" fill={`${color}cc`}>$</text>
    </svg>
  )
}

type ItemType = 'helmet' | 'gloves' | 'cleats' | 'avatar_frame' | 'title' | 'emote' | 'coins'
const ITEM_ART: Record<ItemType, (color: string) => React.ReactNode> = {
  helmet: (c) => <HelmetSVG color={c}/>,
  gloves: (c) => <GlovesSVG color={c}/>,
  cleats: (c) => <CleatsSVG color={c}/>,
  avatar_frame: (c) => <FrameSVG color={c}/>,
  title: (c) => <TitleSVG color={c}/>,
  emote: (c) => <EmoteSVG color={c}/>,
  coins: (c) => <CoinsSVG color={c}/>,
}

const MOCK_ITEMS = [
  { id: 'm1', name: 'Carbon Visor',      type: 'helmet' as ItemType,       rarity: 'rare',      price: 800,  desc: 'Sleek carbon-fiber face shield' },
  { id: 'm2', name: 'Speed Cleats',      type: 'cleats' as ItemType,       rarity: 'uncommon',  price: 400,  desc: 'Lightweight for elite speed' },
  { id: 'm3', name: 'Pro Gloves',        type: 'gloves' as ItemType,       rarity: 'common',    price: 200,  desc: 'Extra grip for key catches' },
  { id: 'm4', name: 'Victory Emote',     type: 'emote' as ItemType,        rarity: 'epic',      price: 1200, desc: 'Celebrate in style post-TD' },
  { id: 'm5', name: 'Gold Frame',        type: 'avatar_frame' as ItemType, rarity: 'legendary', price: 2000, desc: 'Reserved for champions only' },
  { id: 'm6', name: 'Elite Title',       type: 'title' as ItemType,        rarity: 'rare',      price: 600,  desc: 'Show off your legacy' },
]

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
  const ownedIds = new Set((ownedRaw as any[] | null)?.map((p: any) => p.item_id) ?? [])

  const hasRealItems = dailyShop && dailyShop.length > 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-950)' }}>

      {/* SHOP HEADER BANNER */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0d1a2e 0%, #07111e 50%, #120a1e 100%)',
        borderBottom: '1px solid rgba(168,85,247,0.2)',
        overflow: 'hidden',
        padding: '3rem 2rem 2rem',
      }}>
        {/* Background shimmer lines */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.8) 0, rgba(255,255,255,0.8) 1px, transparent 1px, transparent 20px)',
        }}/>
        {/* Purple glow */}
        <div style={{
          position: 'absolute', top: '-80px', right: '10%',
          width: '400px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(168,85,247,0.15) 0%, transparent 70%)',
        }}/>
        {/* Gold glow */}
        <div style={{
          position: 'absolute', bottom: '-40px', left: '5%',
          width: '300px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.1) 0%, transparent 70%)',
        }}/>

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '5px 14px', marginBottom: '16px',
                background: 'rgba(168,85,247,0.1)',
                border: '1px solid rgba(168,85,247,0.3)',
                borderRadius: '6px',
              }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#a855f7', animation: 'pulse 2s infinite' }}/>
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.15em', color: '#a855f7', textTransform: 'uppercase' }}>
                  DAILY ROTATION · RESETS MIDNIGHT
                </span>
              </div>
              <h1 style={{
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900,
                fontSize: 'clamp(2.5rem,6vw,5rem)', lineHeight: 0.9,
                textTransform: 'uppercase', letterSpacing: '0.02em', color: 'white',
              }}>
                THE SHOP
              </h1>
            </div>

            {/* Coin balance */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 20px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: '14px',
            }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth="1.5"/>
                <text x="16" y="21" textAnchor="middle" fontFamily="Barlow Condensed,sans-serif" fontWeight="900" fontSize="13" fill="#f59e0b">$</text>
              </svg>
              <div>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '32px', color: '#f59e0b', lineHeight: 1 }}>
                  {coins.toLocaleString()}
                </div>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,158,11,0.6)' }}>
                  COINS
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem 4rem' }}>

        {/* FEATURED ITEM — LEGENDARY SPOTLIGHT */}
        <div style={{ marginBottom: '28px' }}>
          <SectionLabel label="FEATURED · LEGENDARY" color="#f59e0b"/>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            padding: '28px 32px',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(249,115,22,0.05) 50%, rgba(5,8,15,0.8) 100%)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}>
            {/* Sparkle BG */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}/>
            <div style={{ position: 'absolute', top: '-50px', right: '15%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(245,158,11,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}/>

            {/* Item preview */}
            <div style={{
              width: '140px', height: '140px', borderRadius: '20px', flexShrink: 0,
              background: 'rgba(245,158,11,0.1)',
              border: '2px solid rgba(245,158,11,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(245,158,11,0.2)',
              position: 'relative', zIndex: 1,
            }}>
              <HelmetSVG color="#f59e0b"/>
            </div>

            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '11px', letterSpacing: '0.15em', color: '#f59e0b' }}>⭐ LEGENDARY</span>
              </div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '32px', color: 'white', lineHeight: 1, marginBottom: '8px' }}>
                Elite Gold Helmet
              </div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
                Championship-grade equipment with 24k finish. Worn by legends only.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '40px', color: '#f59e0b', lineHeight: 1 }}>2,400</div>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,158,11,0.6)' }}>COINS</div>
                </div>
                <form action="/api/purchase" method="POST">
                  <button type="submit" style={{
                    padding: '12px 28px',
                    background: '#f59e0b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#05080f',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 900,
                    fontSize: '16px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: coins >= 2400 ? 'pointer' : 'not-allowed',
                    opacity: coins >= 2400 ? 1 : 0.4,
                    boxShadow: coins >= 2400 ? '0 4px 20px rgba(245,158,11,0.4)' : 'none',
                  }}>
                    BUY NOW
                  </button>
                </form>
                {coins < 2400 && (
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                    Need {(2400 - coins).toLocaleString()} more coins
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DAILY ITEMS GRID */}
        <div>
          <SectionLabel label="TODAY'S ITEMS" color="#f97316"/>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
            {(hasRealItems
              ? dailyShop!.map((e: any) => ({ ...e.shop_items, entry_id: e.id }))
              : MOCK_ITEMS
            ).map((item: any, i: number) => {
              const r = RARITY[item.rarity] ?? RARITY.common
              const isOwned = ownedIds.has(item.id)
              const artFn = ITEM_ART[item.type as ItemType] ?? ITEM_ART.coins
              const canAfford = coins >= (item.price || 0)

              return (
                <div key={item.id ?? i} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isOwned ? 'rgba(34,197,94,0.3)' : r.border}`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: isOwned ? 'none' : `0 0 20px ${r.glow}`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}>
                  {/* Rarity top bar */}
                  <div style={{ height: '3px', background: r.color, opacity: 0.8 }}/>

                  {/* Item preview area */}
                  <div style={{
                    height: '140px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: r.bg,
                    position: 'relative',
                  }}>
                    {artFn(r.color)}

                    {/* Rarity badge */}
                    <div style={{
                      position: 'absolute', top: '10px', left: '10px',
                      padding: '3px 10px',
                      background: `${r.color}20`,
                      border: `1px solid ${r.color}44`,
                      borderRadius: '6px',
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontWeight: 800, fontSize: '10px',
                      letterSpacing: '0.1em', color: r.color,
                    }}>
                      {r.label}
                    </div>

                    {/* Owned badge */}
                    {isOwned && (
                      <div style={{
                        position: 'absolute', top: '10px', right: '10px',
                        padding: '3px 10px',
                        background: 'rgba(34,197,94,0.2)',
                        border: '1px solid rgba(34,197,94,0.4)',
                        borderRadius: '6px',
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontWeight: 800, fontSize: '10px',
                        letterSpacing: '0.1em', color: '#22c55e',
                      }}>
                        OWNED
                      </div>
                    )}
                  </div>

                  {/* Item info */}
                  <div style={{ padding: '14px 16px 16px' }}>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '17px', color: 'white', lineHeight: 1, marginBottom: '4px' }}>
                      {item.name}
                    </div>
                    {item.desc && (
                      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', lineHeight: 1.3 }}>
                        {item.desc}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '22px', color: '#f59e0b', lineHeight: 1 }}>{(item.price || 0).toLocaleString()}</span>
                        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '11px', color: 'rgba(245,158,11,0.6)', marginLeft: '5px' }}>coins</span>
                      </div>
                      {isOwned ? (
                        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', color: '#22c55e' }}>✓ Equipped</span>
                      ) : (
                        <form action="/api/purchase" method="POST">
                          <input type="hidden" name="item_id" value={item.id}/>
                          <button type="submit" style={{
                            padding: '8px 18px',
                            background: canAfford ? r.color : 'rgba(255,255,255,0.08)',
                            border: 'none',
                            borderRadius: '8px',
                            color: canAfford ? '#05080f' : 'rgba(255,255,255,0.3)',
                            fontFamily: 'Barlow Condensed, sans-serif',
                            fontWeight: 800, fontSize: '13px',
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                            cursor: canAfford ? 'pointer' : 'not-allowed',
                          }}>
                            {canAfford ? 'BUY' : 'CAN\'T AFFORD'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
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

function SectionLabel({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
      <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: color }}/>
      <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: `${color}20` }}/>
    </div>
  )
}
