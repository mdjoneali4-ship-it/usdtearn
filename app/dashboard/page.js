'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Wallet, CheckCircle2, Users, Crown, ArrowUpRight, 
  ArrowDownLeft, LogOut, ShieldCheck, Zap, Sparkles, Award 
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 1. Fetch Profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userProfile) setProfile(userProfile)

      // 2. Fetch Completed Tasks Count
      const { count } = await supabase
        .from('user_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (count !== null) setCompletedCount(count)
      setLoading(false)
    }

    loadUserData()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-emerald-400 font-semibold text-xs tracking-wider animate-pulse">LOADING SECURE DASHBOARD...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* TOP BAR / HEADER */}
        <div className="flex justify-between items-center bg-slate-900/80 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-lg shadow-lg shadow-emerald-500/20">
              {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                {profile?.full_name || 'Valued User'}
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h1>
              <p className="text-[11px] text-slate-400">{profile?.email}</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="p-2.5 bg-slate-800/80 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-xl transition border border-slate-700/50"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* TRUST BANNER / 100% SECURE GUARANTEE */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-lg shadow-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-emerald-400 tracking-wide">100% SECURED & VERIFIED PAYOUTS</h2>
              <p className="text-[11px] text-slate-300">Instant manual & automated task verification with guaranteed rewards.</p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Active System
          </span>
        </div>

        {/* BALANCE & VIP CARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Main Balance Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
            <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Wallet className="w-4 h-4 text-emerald-400" /> Available Balance
            </p>
            <h2 className="text-3xl font-extrabold text-slate-100 mt-2 tracking-tight">
              ${parseFloat(profile?.balance || 0).toFixed(4)} <span className="text-xs text-emerald-400 font-normal">USDT</span>
            </h2>

            <div className="flex gap-2 mt-5">
              <Link 
                href="/deposit" 
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/10"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" /> Deposit
              </Link>
              <Link 
                href="/withdraw" 
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-1 border border-slate-700"
              >
                <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
              </Link>
            </div>
          </div>

          {/* VIP Level Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl relative overflow-hidden shadow-xl flex flex-col justify-between">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>
            <div>
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Crown className="w-4 h-4 text-amber-400" /> Membership Tier
                </p>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  VIP Level {profile?.vip_level || 0}
                </span>
              </div>
              <h2 className="text-xl font-bold text-amber-400 mt-2">
                VIP {profile?.vip_level || 0} Member
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                {profile?.vip_level > 0 ? 'Enjoying higher earnings & exclusive tasks.' : 'Upgrade your VIP to maximize daily earnings.'}
              </p>
            </div>

            <Link 
              href="/vip" 
              className="mt-4 w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 font-bold text-xs rounded-xl transition text-center block"
            >
              Upgrade VIP Tiers
            </Link>
          </div>

        </div>

        {/* QUICK STATS ROW */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Tasks Completed</p>
              <h3 className="text-lg font-bold text-slate-100">{completedCount}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Referral Code</p>
              <h3 className="text-sm font-bold text-indigo-400 tracking-wider">{profile?.referral_code || '------'}</h3>
            </div>
          </div>
        </div>

        {/* NAVIGATION / ACTION MENU */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Quick Navigation</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link 
              href="/tasks" 
              className="p-3.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">Task Center</h4>
                  <p className="text-[10px] text-slate-400">Complete tasks & earn USDT</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
            </Link>

            <Link 
              href="/referrals" 
              className="p-3.5 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-2xl flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:scale-110 transition">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">Referral Hub</h4>
                  <p className="text-[10px] text-slate-400">Invite friends & earn commission</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
            </Link>
          </div>
        </div>

        {/* RECENT WITHDRAWAL PROOF BANNER (Builds Trust) */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl text-center space-y-1">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 font-medium">
            <Award className="w-3.5 h-3.5 text-amber-400" /> Platform Payout Status: <span className="text-emerald-400 font-bold">100% Operational & Fast</span>
          </p>
          <p className="text-[10px] text-slate-500">All withdrawal requests are processed securely within 24 hours.</p>
        </div>

      </div>
    </div>
  )
          }
                
