'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Crown, CheckCircle2, ArrowLeft, Zap } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function VIPPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // VIP Plans (VIP 1, VIP 2 = 500, VIP 3 = 750, VIP 4 = 1000)
  const vipPlans = [
    { level: 0, name: 'VIP 0 (Free)', price: 0, dailyTasks: 2, taskReward: 0.10, dailyIncome: 0.20 },
    { level: 1, name: 'VIP 1 Standard', price: 10, dailyTasks: 5, taskReward: 0.50, dailyIncome: 2.50 },
    { level: 2, name: 'VIP 2 Pro', price: 500, dailyTasks: 15, taskReward: 2.00, dailyIncome: 30.00 },
    { level: 3, name: 'VIP 3 Elite', price: 750, dailyTasks: 25, taskReward: 2.50, dailyIncome: 62.50 },
    { level: 4, name: 'VIP 4 Master', price: 1000, dailyTasks: 40, taskReward: 3.00, dailyIncome: 120.00 },
  ]

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) setProfile(data)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleUpgrade = async (plan) => {
    if (!profile) return router.push('/login')
    if (profile.balance < plan.price) {
      alert(`Insufficient balance! You need $${plan.price} USDT. Please deposit first.`)
      return router.push('/deposit')
    }

    if (confirm(`Are you sure you want to upgrade to ${plan.name} for $${plan.price} USDT?`)) {
      const newBalance = profile.balance - plan.price
      const { error } = await supabase
        .from('profiles')
        .update({ balance: newBalance, vip_level: plan.level })
        .eq('id', profile.id)

      if (error) {
        alert('Upgrade failed: ' + error.message)
      } else {
        alert(`Successfully upgraded to ${plan.name}!`)
        window.location.reload()
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <Crown className="w-5 h-5" /> VIP Membership
            </h1>
            <p className="text-xs text-slate-400">Upgrade your level to boost daily earnings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vipPlans.map((plan) => {
            const isCurrent = profile?.vip_level === plan.level
            return (
              <div 
                key={plan.level} 
                className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                  isCurrent ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-900 border-slate-800'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-3 right-4 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Current Level
                  </span>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-bold text-slate-100">{plan.name}</h2>
                      <p className="text-2xl font-extrabold text-amber-400 mt-1">
                        ${plan.price} <span className="text-xs text-slate-400 font-normal">USDT / TK</span>
                      </p>
                    </div>
                    <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                      <Zap className="w-5 h-5" />
                    </div>
                  </div>

                  <hr className="border-slate-800" />

                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Daily Tasks: <strong>{plan.dailyTasks}</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Reward Per Task: <strong>${plan.taskReward}</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Daily Max Profit: <strong>${plan.dailyIncome}</strong>
                    </li>
                  </ul>
                </div>

                <button
                  disabled={isCurrent || plan.level === 0}
                  onClick={() => handleUpgrade(plan)}
                  className={`w-full mt-6 py-2.5 rounded-xl font-bold text-xs transition ${
                    isCurrent 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  }`}
                >
                  {isCurrent ? 'Active Level' : `Unlock for $${plan.price}`}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
                  }
