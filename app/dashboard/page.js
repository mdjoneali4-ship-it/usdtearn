'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Wallet, CheckSquare, ArrowUpRight, LogOut, User, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data)
      setLoading(false)
    }

    getProfile()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-emerald-400 font-semibold animate-pulse">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-100">{profile?.full_name || 'User'}</h2>
              <p className="text-xs text-slate-400">{profile?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 text-xs flex items-center gap-1 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-2xl shadow-xl flex justify-between items-center">
          <div>
            <p className="text-xs text-emerald-100 uppercase tracking-wider font-semibold">Total Balance</p>
            <h1 className="text-3xl font-extrabold text-white mt-1">${profile?.balance || 0.00} USDT</h1>
          </div>
          <Link href="/deposit" className="px-4 py-2.5 bg-slate-950 text-emerald-400 font-bold rounded-xl text-xs hover:bg-slate-900 transition flex items-center gap-1">
            <Wallet className="w-4 h-4" /> Deposit
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/tasks" className="p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition flex flex-col justify-between h-28">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="font-bold text-sm text-slate-100">Earn Money</p>
              <p className="text-[10px] text-slate-400">Complete tasks & earn</p>
            </div>
          </Link>

          <Link href="/withdraw" className="p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition flex flex-col justify-between h-28">
            <ArrowUpRight className="w-6 h-6 text-teal-400" />
            <div>
              <p className="font-bold text-sm text-slate-100">Withdraw</p>
              <p className="text-[10px] text-slate-400">Cashout via bKash/Nagad</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
          }
