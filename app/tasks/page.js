'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Lock, ExternalLink, PlusCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function TasksPage() {
  const [profile, setProfile] = useState(null)
  const [tasks, setTasks] = useState([])
  const [completedTaskIds, setCompletedTaskIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState(null)

  useEffect(() => {
    async function loadTasksData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // 1. Fetch Profile
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile(userProfile)

        // 2. Fetch User Completed Task IDs
        const { data: completions } = await supabase
          .from('user_tasks')
          .select('task_id')
          .eq('user_id', user.id)

        if (completions) {
          setCompletedTaskIds(completions.map((c) => c.task_id))
        }
      }

      // 3. Fetch Approved Tasks
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (allTasks) {
        setTasks(allTasks)
      }

      setLoading(false)
    }

    loadTasksData()
  }, [])

  const handleCompleteTask = async (task) => {
    if (!profile) return
    setSubmittingId(task.id)

    // Insert task completion log
    const { error: completeError } = await supabase.from('user_tasks').insert([
      {
        user_id: profile.id,
        task_id: task.id,
      },
    ])

    if (completeError) {
      alert('You have already completed this task or an error occurred.')
      setSubmittingId(null)
      return
    }

    // Reward user balance
    const newBalance = (parseFloat(profile.balance || 0) + parseFloat(task.reward)).toFixed(4)

    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', profile.id)

    if (!balanceError) {
      setProfile({ ...profile, balance: newBalance })
      setCompletedTaskIds([...completedTaskIds, task.id])
      alert(`Task Completed! You earned $${task.reward}`)
    }

    setSubmittingId(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-emerald-400 font-semibold animate-pulse">Loading Tasks...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with Post Task Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-slate-800 rounded-xl text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-100">Task Center</h1>
              <p className="text-xs text-slate-400">Complete micro-tasks & earn rewards</p>
            </div>
          </div>

          {/* Post Task Button */}
          <Link
            href="/tasks/create"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" /> Post a Task
          </Link>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-10">No active tasks available right now.</p>
          ) : (
            tasks.map((task) => {
              const isCompleted = completedTaskIds.includes(task.id)
              const isLocked = (profile?.vip_level || 0) < (task.min_vip_level || 0)

              return (
                <div
                  key={task.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap justify-between items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-sm text-slate-100">{task.title}</h2>
                      {task.min_vip_level > 0 && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                          VIP {task.min_vip_level}+
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-emerald-400">+${task.reward} USDT</p>
                  </div>

                  <div>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </span>
                    ) : isLocked ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl">
                        <Lock className="w-4 h-4" /> VIP {task.min_vip_level} Required
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {task.link && task.link !== '#' && (
                          <a
                            href={task.link}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleCompleteTask(task)}
                          disabled={submittingId === task.id}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-xs rounded-xl transition"
                        >
                          {submittingId === task.id ? 'Claiming...' : 'Claim Reward'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}
