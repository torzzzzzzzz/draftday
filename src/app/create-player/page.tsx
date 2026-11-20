import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlayerCreator } from '@/components/player/PlayerCreator'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Create Player' }

export default async function CreatePlayerPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirectTo=/create-player')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-5xl font-800 text-white">CREATE YOUR PLAYER</h1>
        <p className="text-gray-400 mt-2">Build your football player from the ground up. Every detail matters.</p>
      </div>
      <PlayerCreator userId={user.id} />
    </div>
  )
}
