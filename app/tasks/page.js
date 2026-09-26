'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Lock, ExternalLink, PlusCircle, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function TasksPage() {
  const [profile, setProfile] = useState(null)
  const [tasks, setTasks] = useState([])
  const [completedTaskIds, setCompletedTaskIds] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Proof Modal State
  const [selectedTask, setSelectedTask] = useState(null)
  const [proofText, setProofText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadTasksData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile(userProfile)

        // Fetch user's submitted or completed task proofs
        const { data: completions } = await supabase
          .from('task_proofs')
          .select('task_id')
          .eq('user_id', user.id)

        if (completions) {
          setCompletedTaskIds(completions.map((c) => c.task_id))
        }
      }

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

  const handleSubmitProof = async (e) => {
    e.preventDefault()
    if (!profile || !selectedTask) return
    setSubmitting(true)

    const { error } = await supabase.from('task_proofs').insert([
      {
        task_id: selectedTask.id,
        user_id: profile.id,
        proof_text: proofText,
        status: 'pending'
      },
    ])

    if (error) {
      alert('Error submitting proof: ' + error.message)
    } else {
      alert('Proof submitted successfully! Waiting for admin/owner approval.')
      setCompletedTaskIds([...completedTaskIds, selectedTask.id])
      setSelectedTask(null)
      setProofText('')
    }
    setSubmitting(false)
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
        
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-slate-800 rounded-xl text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-100">Task Center</h1>
              <p className="text-xs text-slate-400">Complete tasks and submit proof to earn rewards</p>
            </div>
          </div>

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
                  className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-sm text-slate-100">{task.title}</h2>
                        {task.min_vip_level > 0 && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                            VIP {task.min_vip_level}+
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/60">
                          {task.description}
                        </p>
                      )}
                      <p className="text-xs font-semibold text-emerald-400">Reward: +${task.reward} USDT</p>
                    </div>

                    <div>
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                          <CheckCircle2 className="w-4 h-4" /> Pending Review
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
                            onClick={() => setSelectedTask(task)}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-xs rounded-xl transition"
                          >
                            Submit Proof
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Proof Submission Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-100">Submit Task Proof</h3>
              <p className="text-xs text-slate-400">Task: <span className="text-emerald-400 font-semibold">{selectedTask.title}</span></p>
              
              <form onSubmit={handleSubmitProof} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Proof Details / Username / Screenshot Link</label>
                  <textarea
                    rows="3"
                    required
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                    placeholder="Enter your submitted username or proof link..."
                    className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> {submitting ? 'Submitting...' : 'Send Proof'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
                                }
          
