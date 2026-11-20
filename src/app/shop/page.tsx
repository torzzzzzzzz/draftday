import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShoppingBag, RefreshCw, Info } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Shop' }

const RARITY_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  common:    { label: 'Common',    color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
  uncommon:  { label: 'Uncommon',  color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
  rare:      { label: 'Rare',      color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  epic:      { label: 'Epic',      color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  legendary: { label: 'Legendary', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
}

export default async function ShopPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, dailyShopRes] = await Promise.all([
    supabase.from('profiles').select('coins').eq('id', user.id).single(),
    supabase
      .from('daily_shop')
      .select(`*, shop_items(*)`)
      .eq('date', new Date().toISOString().slice(0, 10))
      .limit(8),
  ])
  const profile = profileRes.data as { coins: number } | null
  const dailyShop = dailyShopRes.data as any[] | null

  const coins = profile?.coins ?? 0

  // Get owned item IDs
  const { data: ownedRaw } = await supabase
    .from('purchases')
    .select('item_id')
    .eq('user_id', user.id)
  const owned = ownedRaw as any[] | null
  const ownedIds = new Set(owned?.map((p: any) => p.item_id) ?? [])

  const ITEM_TYPE_EMOJI: Record<string, string> = {
    helmet: '🪖',
    visor: '😎',
    gloves: '🧤',
    cleats: '👟',
    avatar_frame: '🖼️',
    title: '🏷️',
    emote: '🎭',
    equipment: '🏈',
    coins: '🪙',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-5xl font-800 text-white">SHOP</h1>
          <p className="text-gray-400 mt-1">Daily rotating items — refreshes at midnight</p>
        </div>
        <div className="coin-badge text-lg px-4 py-2">
          🪙 {coins.toLocaleString()}
        </div>
      </div>

      {/* Daily shop */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw size={16} className="text-brand-400" />
          <h2 className="font-display font-700 text-xl text-white">Daily Deals</h2>
          <span className="text-xs text-gray-500 ml-2">8 items · refreshes daily</span>
        </div>

        {dailyShop && dailyShop.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {dailyShop.map((slot) => {
              const item = slot.shop_items as any
              if (!item) return null
              const rarity = RARITY_LABEL[item.rarity ?? 'common']
              const isOwned = ownedIds.has(item.id)
              const canAfford = coins >= (slot.sale_price ?? item.price)
              const price = slot.sale_price ?? item.price

              return (
                <div
                  key={slot.id}
                  className="card relative overflow-hidden"
                  style={{ borderColor: `${rarity.color}33` }}
                >
                  {/* Rarity stripe */}
                  <div className="h-1" style={{ background: rarity.color }} />

                  <div className="p-4">
                    {/* Item icon */}
                    <div
                      className="w-full aspect-square rounded-xl flex items-center justify-center text-5xl mb-3"
                      style={{ background: rarity.bg }}
                    >
                      {ITEM_TYPE_EMOJI[item.item_type] ?? '🎁'}
                    </div>

                    {/* Item info */}
                    <div className="text-xs font-medium mb-0.5" style={{ color: rarity.color }}>
                      {rarity.label}
                    </div>
                    <h3 className="font-display font-700 text-sm text-white leading-tight mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>

                    {/* Sale badge */}
                    {slot.sale_price && slot.sale_price < item.price && (
                      <div className="text-xs text-gray-500 line-through mb-0.5">🪙 {item.price}</div>
                    )}

                    {/* Buy button */}
                    {isOwned ? (
                      <div className="btn btn-ghost text-xs py-1.5 w-full cursor-default opacity-50">
                        ✓ Owned
                      </div>
                    ) : (
                      <button
                        className={`btn text-xs py-1.5 w-full ${canAfford ? 'btn-gold' : 'btn-ghost opacity-40 cursor-not-allowed'}`}
                        disabled={!canAfford}
                      >
                        🪙 {price.toLocaleString()}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <ShoppingBag size={40} className="mx-auto mb-4 text-gray-600" />
            <h3 className="font-display font-700 text-xl text-white mb-2">Shop Refreshing…</h3>
            <p className="text-gray-400">New daily items are being added. Check back soon!</p>
          </div>
        )}
      </div>

      {/* How to earn coins */}
      <div className="card p-5 bg-brand-500/5 border-brand-500/20">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-brand-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-medium text-white mb-1">How to Earn Coins</h3>
            <ul className="text-sm text-gray-400 space-y-0.5">
              <li>🏈 Win games in career mode → 25–150 coins</li>
              <li>✅ Complete daily challenges → 50–200 coins</li>
              <li>📅 Complete weekly challenges → 150–500 coins</li>
              <li>🎁 Battle pass tier rewards → up to 1000 coins</li>
              <li>🏆 Win championships → 500 bonus coins</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
