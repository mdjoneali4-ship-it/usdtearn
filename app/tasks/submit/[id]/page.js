'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'
import { supabase } from '../../../../lib/supabase'

export default function SubmitProofPage() {
  const router = useRouter()
  const { id: taskId } = useParams()
  const [task, setTask] = useState(null)
  const [proofText, setProofText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchTask() {
      const { data } = await supabase.from('tasks').select('*').eq('id', taskId).single()
      if (data) setTask(data)
      setLoading(false)
    }
    fetchTask()
  }, [taskId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please login first')
      router.push('/login')
      return
    }

    const { error } = await supabase.from('task_proofs').insert([
      {
        task_id: taskId,
        worker_id: user.id,
        proof_text: proofText,
        status: 'pending'
      }
    ])

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('Proof submitted! Waiting for Task Owner approval.')
      router.push('/tasks')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <Link href="/tasks" className="p-2 bg-slate-800 rounded-xl text-slate-300">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Submit Work Proof</h1>
            <p className="text-xs text-slate-400">{task?.title}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Proof Details (Username/Transaction ID/Screenshot Link)</label>
            <textarea
              required
              rows="4"
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              placeholder="e.g. My Telegram username is @john_doe"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 rounded-xl transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting Proof...' : 'Submit Proof'}
          </button>
        </form>
      </div>
    </div>
  )
    }
