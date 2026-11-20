import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-5xl font-800 text-white mb-2">Terms of Service</h1>
      <p className="text-gray-400 mb-8">Last updated: {new Date().getFullYear()}</p>
      <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
        <section>
          <h2 className="font-display font-700 text-xl text-white mb-2">Acceptance</h2>
          <p>By creating an account on Draft Day, you agree to these terms. Draft Day is a free-to-play football career simulator game.</p>
        </section>
        <section>
          <h2 className="font-display font-700 text-xl text-white mb-2">Account Rules</h2>
          <p>You must be 13 or older to create an account. One account per person. Do not share accounts or use automation to gain unfair advantages. We reserve the right to ban accounts that violate these terms.</p>
        </section>
        <section>
          <h2 className="font-display font-700 text-xl text-white mb-2">In-Game Currency</h2>
          <p>Draft Day coins are virtual currency with no real-world monetary value. They cannot be transferred, sold, or refunded.</p>
        </section>
        <section>
          <h2 className="font-display font-700 text-xl text-white mb-2">Content</h2>
          <p>Be respectful in all community interactions. We reserve the right to remove content and suspend accounts that violate our community guidelines.</p>
        </section>
        <section>
          <h2 className="font-display font-700 text-xl text-white mb-2">Changes</h2>
          <p>We may update these terms at any time. Continued use of the game after changes constitutes acceptance of the new terms.</p>
        </section>
      </div>
    </div>
  )
}
