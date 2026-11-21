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
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'linear-gradient(135deg,#f97316,#ea580c)',boxShadow:'0 0 32px rgba(249,115,22,0.3)'}}>
            <span style={{fontFamily:'Barlow Condensed,sans-serif',fontWeight:900,fontSize:'1.5rem',color:'#fff'}}>DD</span>
          </div>
          <h1 style={{fontFamily:'Barlow Condensed,sans-serif',fontWeight:800,fontSize:'2.25rem',color:'#f8f4ef'}}>Welcome Back</h1>
          <p style={{color:'#8ba0c4',marginTop:'0.5rem'}}>Sign in to continue your career</p>
        </div>

        {searchParams.message && (
          <div className="mb-4 p-3 rounded-xl text-sm text-center" style={{background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.2)',color:'#f97316'}}>
            {searchParams.message}
          </div>
        )}

        <div className="card p-6">
          <LoginForm redirectTo={searchParams.redirectTo} />
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" style={{color:'#f97316',fontWeight:500}}>
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  )
}
