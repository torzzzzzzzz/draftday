import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sign In' }

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string; message?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/20">
            <span className="font-display font-900 text-2xl text-white">DD</span>
          </div>
          <h1 className="font-display text-4xl font-800 text-white">Welcome Back</h1>
          <p className="text-gray-400 mt-2">Sign in to continue your career</p>
        </div>

        {searchParams.message && (
          <div className="mb-4 p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-400 text-sm text-center">
            {searchParams.message}
          </div>
        )}

        <div className="card p-6">
          <LoginForm redirectTo={searchParams.redirectTo} />
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  )
}
