'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferralCode(ref.toUpperCase())
    }
  }, [searchParams])

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)

    // 1. Auth Signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      alert(authError.message)
      setLoading(false)
      return
    }

    // 2. Profile Creation with Referral Code
    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: authData.user.id,
          full_name: fullName,
          email: email,
          balance: 0.00,
          vip_level: 0,
          referred_by: referralCode ? referralCode.trim().toUpperCase() : null,
        },
      ])

      if (profileError) {
        alert('Profile error: ' + profileError.message)
      } else {
        alert('Registration successful!')
        router.push('/dashboard')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100">Create Account</h1>
          <p className="text-xs text-slate-400 mt-1">Start earning micro-rewards today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-semibold">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-emerald-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-emerald-500"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold">Referral Code (Optional)</label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-amber-400 font-bold mt-1 focus:outline-none focus:border-amber-500"
              placeholder="EX: A1B2C3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 rounded-xl text-xs transition mt-2"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-400 font-bold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}
