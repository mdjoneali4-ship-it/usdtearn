'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Zap, Globe, Crown, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function TasksPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completedTasks, setCompletedTasks] = useState([])

  const publicTasks = [
    { id: 'p1', title: 'Subscribe YouTube Channel', reward: 0.03, link: 'https://youtube.com' },
    { id: 'p2', title: 'Join Official Telegram Group', reward: 0.02, link: 'https://telegram.org' },
    { id: 'p3', title: 'Visit Partner Website', reward: 0.02, link: 'https://google.com' },
  ]

  const vipTasks = [
    { id: 'v1', title: 'VIP 1 Daily Ad Task 1', reward: 0.125, minVip: 1 },
    { id: 'v2', title: 'VIP 1 Daily Ad Task 2', reward: 0.125, minVip: 1 },
    { id: 'v3', title: 'VIP 2 Sponsored Video Task', reward: 0.24, minVip: 2 },
    { id: 'v4', title: 'VIP 3 High Yield Ad Review', reward: 0.50, minVip: 3 },
    { id: 'v5', title: 'VIP 4 Premium Rating Task', reward: 0.81, minVip: 4 },
    { id: 'v6', title: 'VIP 5 Master Review Task', reward: 1.40, minVip: 5 },
  ]

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data)
      setLoading(false)
    }
    fetchProfile()
  }, [router])

  const handleCompleteTask = async (task) => {
    if (!profile) return

    if (completedTasks.includes(task.id)) {
      alert('You have already completed this task today!')
      return
    }

    const updatedBalance = (Number(profile.balance) + Number(task.reward)).toFixed(2)

    const { error } = await supabase
      .from('profiles')
      .update({ balance: updatedBalance })
      .eq('id', profile.id)

    if (error) {
      alert('Error updating balance: ' + error.message)
    } else {
      alert(`Task Completed! You earned $${task.reward} USDT`)
      setCompletedTasks([...completedTasks, task.id])
      setProfile({ ...profile, balance: updatedBalance })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-emerald-400 font-semibold animate-pulse">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-slate-800 rounded-xl text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Task Center
              </h1>
              <p className="text-xs text-slate-400">Current VIP Level: <span className="text-amber-400 font-bold">VIP {profile?.vip_level || 0}</span></p>
            </div>
          </div>
        </div>

        {/* SECTION 1: PUBLIC / FREE TASKS */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" /> Public Tasks (All Users)
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {publicTasks.map((task) => (
              <div key={task.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                    {task.title}
                    <a href={task.link} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-emerald-400">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </h3>
                  <p className="text-xs text-emerald-400 font-bold mt-1">+${task.reward} USDT</p>
                </div>
                <button
                  disabled={completedTasks.includes(task.id)}
                  onClick={() => handleCompleteTask(task)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    completedTasks.includes(task.id)
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                  }`}
                >
                  {completedTasks.includes(task.id) ? 'Completed' : 'Submit Task'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: VIP EXCLUSIVE TASKS */}
        <div className="space-y-3 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Crown className="w-4 h-4" /> VIP Exclusive Tasks
            </h2>
            <Link href="/vip" className="text-[11px] text-amber-400 font-bold hover:underline">
              Upgrade VIP Level →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {vipTasks.map((task) => {
              const isLocked = (profile?.vip_level || 0) < task.minVip
              const isCompleted = completedTasks.includes(task.id)

              return (
                <div 
                  key={task.id} 
                  className={`p-4 rounded-2xl border flex justify-between items-center ${
                    isLocked 
                      ? 'bg-slate-950/60 border-slate-850 opacity-60' 
                      : 'bg-slate-900 border-amber-500/20'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">{task.title}</h3>
                    <p className="text-xs text-amber-400 font-bold mt-1">+${task.reward} USDT</p>
                  </div>

                  {isLocked ? (
                    <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-3 py-1.5 rounded-xl border border-slate-700">
                      Requires VIP {task.minVip}
                    </span>
                  ) : (
                    <button
                      disabled={isCompleted}
                      onClick={() => handleCompleteTask(task)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        isCompleted
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'Claim Reward'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
    }
          
