import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}

function LogOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

const SectionHeader = ({ icon, label, danger = false }: { icon: React.ReactNode, label: string, danger?: boolean }) => (
  <div style={{
    padding: '14px 20px',
    borderBottom: `1px solid ${danger ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }}>
    <span style={{ color: danger ? '#EF4444' : 'var(--accent-orange)' }}>{icon}</span>
    <h2 style={{
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '12px',
      color: danger ? '#EF4444' : 'white',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      margin: 0,
    }}>{label}</h2>
  </div>
)

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '10px 14px',
  color: 'white',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}

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
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="font-display font-800 text-white" style={{ fontSize: '48px', margin: 0 }}>SETTINGS</h1>
        <p style={{ color: '#6B7280', marginTop: '4px', fontSize: '14px' }}>Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <SectionHeader icon={<UserIcon />} label="Profile" />
        <form action="/api/settings/update-profile" method="POST" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#9CA3AF', marginBottom: '6px', fontWeight: 500 }}>Display Name</label>
            <input
              name="display_name"
              type="text"
              defaultValue={profile?.display_name ?? ''}
              maxLength={50}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#9CA3AF', marginBottom: '6px', fontWeight: 500 }}>Username</label>
            <input
              name="username"
              type="text"
              defaultValue={profile?.username ?? ''}
              pattern="[a-zA-Z0-9_]{3,20}"
              maxLength={20}
              style={inputStyle}
            />
            <p style={{ fontSize: '11px', color: '#4B5563', marginTop: '4px' }}>3–20 chars, letters/numbers/underscore only</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#9CA3AF', marginBottom: '6px', fontWeight: 500 }}>Bio</label>
            <textarea
              name="bio"
              defaultValue={profile?.bio ?? ''}
              maxLength={160}
              rows={3}
              placeholder="Tell other players about yourself…"
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            Save Changes
          </button>
        </form>
      </div>

      {/* Account Section */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <SectionHeader icon={<ShieldIcon />} label="Account" />
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#9CA3AF', marginBottom: '6px', fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={user.email ?? ''}
              disabled
              style={{ ...inputStyle, background: 'rgba(255,255,255,0.03)', color: '#4B5563', cursor: 'not-allowed' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#9CA3AF', marginBottom: '8px', fontWeight: 500 }}>Change Password</label>
            <form action="/api/settings/change-password" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                name="new_password"
                type="password"
                placeholder="New password (min 8 chars)"
                minLength={8}
                style={inputStyle}
              />
              <button type="submit" className="btn btn-secondary" style={{ alignSelf: 'flex-start', fontSize: '13px' }}>
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <SectionHeader icon={<BellIcon />} label="Notifications" />
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { key: 'friend_requests', label: 'Friend requests' },
            { key: 'game_results', label: 'Game results' },
            { key: 'challenge_complete', label: 'Challenge completions' },
            { key: 'level_up', label: 'Level up' },
            { key: 'battle_pass', label: 'Battle pass rewards' },
          ].map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#D1D5DB' }}>{label}</span>
              <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
        <SectionHeader icon={<TrashIcon />} label="Danger Zone" danger />
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <form action="/auth/signout" method="POST">
            <button type="submit" style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#EF4444',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              <LogOutIcon />
              Sign Out
            </button>
          </form>
          <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '12px', color: '#4B5563', marginBottom: '10px' }}>
              Permanently deletes your account and all data. Cannot be undone.
            </p>
            <button className="btn btn-danger" style={{ width: '100%', fontSize: '14px' }} disabled>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
