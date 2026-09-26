'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const router = useRouter()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatusMsg('Connecting to database...')

    try {
      // 1. Supabase Auth Call
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        alert('Auth Error: ' + authError.message)
        setStatusMsg('Error: ' + authError.message)
        setLoading(false)
        return
      }

      // 2. Profile Creation Call
      if (data?.user) {
        setStatusMsg('Creating profile...')
        const { error: profileError } = await supabase.from('profiles').insert([
          { id: data.user.id, email: formData.email, full_name: formData.name, balance: 0 }
        ])

        if (profileError) {
          alert('Profile Error: ' + profileError.message)
          setStatusMsg('Error: ' + profileError.message)
        } else {
          alert('Account created successfully!')
          router.push('/login')
        }
      }
    } catch (err) {
      alert('System Exception: ' + err.message)
      setStatusMsg('Exception: ' + err.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            Create USDTEarn Account
          </h1>
          <p className="text-xs text-slate-400 mt-1">Start earning USDT with micro-tasks</p>
        </div>

        {statusMsg && (
          <div className="p-3 mb-4 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center">
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <div className="relative mt-1">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input 
                type="text" 
                required
                placeholder="John Doe" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

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
            <UserPlus className="w-4 h-4" /> {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-center text-slate-400 mt-6">
          Already have an account?{' '}
          <Link href="/signup" className="text-emerald-400 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
          }
                  
