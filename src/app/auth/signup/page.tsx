import { SignupForm } from '@/components/auth/SignupForm'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Create Account' }

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/20">
            <span className="font-display font-900 text-2xl text-white">DD</span>
          </div>
          <h1 className="font-display text-4xl font-800 text-white">Join Draft Day</h1>
          <p className="text-gray-400 mt-2">Create your free account and start your career</p>
        </div>

        <div className="card p-6">
          <SignupForm />
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
