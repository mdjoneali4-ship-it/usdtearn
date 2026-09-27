'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Lock, CheckCircle, Upload, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function UserTasksPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [proofText, setProofText] = useState('')
  const [proofFile, setProofFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTasksAndUser()
  }, [])

  async function fetchTasksAndUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      // Fetch User Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setUserProfile(profile)

      // Fetch Approved Tasks
      const { data: allTasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (!error && allTasks) {
        setTasks(allTasks)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitProof = async (e) => {
    e.preventDefault()
    if (!selectedTask || !userProfile) return
    setSubmitting(true)

    try {
      let fileUrl = ''

      // Image upload if file selected
      if (proofFile) {
        const fileExt = proofFile.name.split('.').pop()
        const fileName = `${userProfile.id}_${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('task_proofs')
          .upload(fileName, proofFile)

        if (uploadErr) {
          throw new Error('Image upload failed: ' + uploadErr.message)
        }

        const { data: publicUrlData } = supabase.storage
          .from('task_proofs')
          .getPublicUrl(fileName)

        fileUrl = publicUrlData.publicUrl
      }

      // Insert into task_proofs table
      const { error: insertErr } = await supabase.from('task_proofs').insert([
        {
          task_id: selectedTask.id,
          user_id: userProfile.id,
          proof_text: proofText,
          proof_img: fileUrl,
          status: 'pending'
        }
      ])

      if (insertErr) throw insertErr

      alert('Proof submitted successfully! Admin will review it.')
      setSelectedTask(null)
      setProofText('')
      setProofFile(null)
    } catch (err) {
      alert('Error submitting proof: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <p className="text-sm text-slate-400">Loading tasks...</p>
      </div>
    )
  }

  const userVip = userProfile?.vip_level || 0

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 max-w-md mx-auto pb-20">
      {/* Top Bar */}
      <div className="flex items-center gap-3 bg-slate-900/80 p-4 rounded-2xl mb-6 backdrop-blur border border-slate-800/80">
        <Link href="/dashboard" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition">
          <ArrowLeft className="w-4 h-4 text-slate-300" />
        </Link>
        <div>
          <h1 className="font-bold text-base text-slate-100">Task Center</h1>
          <p className="text-xs text-slate-400">Complete tasks and submit proof to earn rewards</p>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm">No tasks available right now.</p>
          </div>
        ) : (
          tasks.map((task) => {
            const minVip = task.min_vip || 0
            const isLocked = userVip < minVip

            return (
              <div
                key={task.id}
                className="bg-slate-900 p-4 rounded-2xl border border-slate-800/80 space-y-3 shadow-lg"
              >
                {/* Title & VIP Badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-100 leading-snug">{task.title}</h3>
                  {minVip > 0 && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                      VIP {minVip}+
                    </span>
                  )}
                </div>

                {/* Description */}
                {task.description && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/50 whitespace-pre-line leading-relaxed">
                    {task.description}
                  </p>
                )}

                {/* Reward */}
                <p className="text-xs font-bold text-emerald-400">
                  Reward: +${task.reward} USDT
                </p>

                {/* Action Buttons */}
                {isLocked ? (
                  <button
                    disabled
                    className="w-full py-2.5 bg-slate-800/80 text-slate-500 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-800 cursor-not-allowed"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-500" /> VIP {minVip} Required
                  </button>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    {/* Open Link Button */}
                    {task.link && task.link !== '#' && (
                      <a
                        href={task.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition border border-slate-700 text-center"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-400 inline-block" /> Open Link
                      </a>
                    )}

                    {/* Submit Proof Button */}
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition text-center shadow-lg shadow-emerald-500/10"
                    >
                      Submit Proof
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Proof Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 space-y-4 relative">
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-bold text-sm text-slate-100">Submit Task Proof</h2>
            <p className="text-xs text-slate-400">{selectedTask.title}</p>

            <form onSubmit={handleSubmitProof} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 mb-1 block">Proof Details / User Info</label>
                <textarea
                  placeholder="Enter your username, account details or notes..."
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Upload Screenshot (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files[0])}
                  className="w-full text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-slate-800 file:text-slate-200 file:text-xs file:font-bold hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
        }
