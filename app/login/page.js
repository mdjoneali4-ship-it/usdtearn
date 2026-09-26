'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      alert('Login Successful!')
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-400 mt-1">Log in to your USDTEarn account</p>
        </div>

        {error && <div className="p-3 mb-4 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input 
                type="email" 
                required
                placeholder="name@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" /> {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-xs text-center text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-emerald-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
