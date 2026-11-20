import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-5xl font-800 text-white mb-2">Privacy Policy</h1>
      <p className="text-gray-400 mb-8">Last updated: {new Date().getFullYear()}</p>

      <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
        <section>
          <h2 className="font-display font-700 text-xl text-white mb-2">What We Collect</h2>
          <p>We collect the information you provide when creating an account (email, username, display name) and game data generated during your career (player stats, game results, achievements). We do not sell your personal data.</p>
        </section>
        <section>
          <h2 className="font-display font-700 text-xl text-white mb-2">How We Use It</h2>
          <p>Your data is used solely to operate the game: authenticating your account, saving your career progress, displaying leaderboards, and enabling social features like the friends system.</p>
        </section>
        <section>
          <h2 className="font-display font-700 text-xl text-white mb-2">Data Storage</h2>
          <p>All data is stored securely using Supabase (PostgreSQL). We use row-level security to ensure you can only access your own data, except for public leaderboard entries you opt into.</p>
        </section>
        <section>
          <h2 className="font-display font-700 text-xl text-white mb-2">Your Rights</h2>
          <p>You can delete your account and all associated data at any time from the Settings page. For questions, contact us via the community Discord.</p>
        </section>
      </div>
    </div>
  )
}
