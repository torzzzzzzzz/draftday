import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Shield, Bell, LogOut, Trash2, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  const profile = profileRaw as any

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-5xl font-800 text-white">SETTINGS</h1>
        <p className="text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="card mb-4">
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <User size={16} className="text-orange-400" />
          <h2 className="font-display font-700 text-sm text-white uppercase tracking-wider">Profile</h2>
        </div>
        <form action="/api/settings/update-profile" method="POST" className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Display Name</label>
            <input
              name="display_name"
              type="text"
              defaultValue={profile?.display_name ?? ''}
              maxLength={50}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Username</label>
            <input
              name="username"
              type="text"
              defaultValue={profile?.username ?? ''}
              pattern="[a-zA-Z0-9_]{3,20}"
              maxLength={20}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
            <p className="text-xs text-gray-600 mt-1">3–20 chars, letters/numbers/underscore only</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Bio</label>
            <textarea
              name="bio"
              defaultValue={profile?.bio ?? ''}
              maxLength={160}
              rows={3}
              placeholder="Tell other players about yourself…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </form>
      </div>

      {/* Account */}
      <div className="card mb-4">
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <Shield size={16} className="text-orange-400" />
          <h2 className="font-display font-700 text-sm text-white uppercase tracking-wider">Account</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              value={user.email ?? ''}
              disabled
              className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-2.5 text-gray-500 text-sm cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Change Password</label>
            <form action="/api/settings/change-password" method="POST" className="space-y-3">
              <input
                name="new_password"
                type="password"
                placeholder="New password (min 8 chars)"
                minLength={8}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button type="submit" className="btn btn-secondary text-sm">Update Password</button>
            </form>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card mb-4">
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <Bell size={16} className="text-orange-400" />
          <h2 className="font-display font-700 text-sm text-white uppercase tracking-wider">Notifications</h2>
        </div>
        <div className="p-5 space-y-3">
          {[
            { key: 'friend_requests', label: 'Friend requests' },
            { key: 'game_results', label: 'Game results' },
            { key: 'challenge_complete', label: 'Challenge completions' },
            { key: 'level_up', label: 'Level up' },
            { key: 'battle_pass', label: 'Battle pass rewards' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-300">{label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card border-red-500/20">
        <div className="p-4 border-b border-red-500/10 flex items-center gap-2">
          <Trash2 size={16} className="text-red-400" />
          <h2 className="font-display font-700 text-sm text-red-400 uppercase tracking-wider">Danger Zone</h2>
        </div>
        <div className="p-5 space-y-3">
          <form action="/auth/signout" method="POST">
            <button type="submit" className="btn btn-ghost w-full text-left flex items-center gap-2 text-red-400 hover:bg-red-500/10 border-red-500/20">
              <LogOut size={16} />
              Sign Out
            </button>
          </form>
          <div className="pt-2 border-t border-white/5">
            <p className="text-xs text-gray-600 mb-2">Permanently deletes your account and all data. Cannot be undone.</p>
            <button className="btn btn-danger text-sm w-full" disabled>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
