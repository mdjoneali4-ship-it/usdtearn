'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, PlusCircle, Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function CreateTaskPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('') // New Description State
  const [reward, setReward] = useState('')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please login first!')
      router.push('/login')
      return
    }

    const { error } = await supabase.from('tasks').insert([
      {
        title,
        description, // Insert Description to Database
        reward: parseFloat(reward),
        link: link || '#',
        task_type: 'public',
        min_vip_level: 0,
        status: 'pending', // অ্যাডমিন অ্যাপ্রুভ করার আগে পেন্ডিং থাকবে
        created_by: user.id
      }
    ])

    if (error) {
      alert('Error submitting task: ' + error.message)
    } else {
      alert('Task submitted successfully! Waiting for Admin approval.')
      router.push('/tasks')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <Link href="/tasks" className="p-2 bg-slate-800 rounded-xl text-slate-300">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" /> Post a New Task
            </h1>
            <p className="text-xs text-slate-400">Promote your content or channel to platform users</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Subscribe to my Telegram Channel"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Task Description Slot Added Here */}
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Task Description / Instructions</label>
            <textarea
              required
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain step-by-step instructions for workers (e.g. 1. Go to link, 2. Join group, 3. Send screenshot)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Reward Per User ($ USDT)</label>
            <input
              type="number"
              step="0.001"
              required
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="e.g. 0.05"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Task URL / Link</label>
            <input
              type="url"
              required
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://t.me/yourchannel"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 rounded-xl transition flex items-center justify-center gap-2 mt-4"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Submitting...' : 'Submit Task for Review'}
          </button>
        </form>

      </div>
    </div>
  )
}
