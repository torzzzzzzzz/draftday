'use client'

import { useEffect, useState } from 'react'
import { Bell, X, Check, Users, Trophy, Target, ShoppingBag, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { NotificationType } from '@/types/database'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  created_at: string
}

const typeIcon = (type: NotificationType) => {
  switch (type) {
    case 'friend_request': return Users
    case 'achievement': return Trophy
    case 'challenge_complete': return Target
    case 'shop_refresh': return ShoppingBag
    case 'leaderboard': return Star
    default: return Bell
  }
}

export function NotificationBar({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    // Load initial notifications
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setNotifications(data) })

    // Real-time subscription
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const markAllRead = async () => {
    await (supabase as any)
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markRead = async (id: string) => {
    await (supabase as any).from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <div className="fixed top-4 right-16 z-50 md:right-4">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl glass border border-white/10 hover:border-brand-500/30 transition-all"
      >
        <Bell size={18} className="text-gray-400" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 rounded-full text-xs font-bold text-white flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 glass border border-brand-500/20 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  <Check size={12} />
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map(notif => {
                const Icon = typeIcon(notif.type)
                return (
                  <button
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all border-b border-white/5 last:border-0 ${
                      !notif.read ? 'bg-brand-500/5' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      !notif.read ? 'bg-brand-500/20' : 'bg-white/5'
                    }`}>
                      <Icon size={14} className={!notif.read ? 'text-brand-400' : 'text-gray-500'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!notif.read ? 'text-white' : 'text-gray-300'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-brand-400 shrink-0 mt-2" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
