import { SignupForm } from '@/components/auth/SignupForm'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Create Account' }

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'linear-gradient(135deg,#f97316,#ea580c)',boxShadow:'0 0 32px rgba(249,115,22,0.3)'}}>
            <span style={{fontFamily:'Barlow Condensed,sans-serif',fontWeight:900,fontSize:'1.5rem',color:'#fff'}}>DD</span>
          </div>
          <h1 style={{fontFamily:'Barlow Condensed,sans-serif',fontWeight:800,fontSize:'2.25rem',color:'#f8f4ef'}}>Join Draft Day</h1>
          <p style={{color:'#8ba0c4',marginTop:'0.5rem'}}>Create your free account and start your career</p>
        </div>

        <div className="card p-6">
          <SignupForm />
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" style={{color:'#f97316',fontWeight:500}}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
