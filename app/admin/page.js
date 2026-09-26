'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, CheckSquare, ShieldCheck, Plus, Search, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
  // New Task Form State
  const [taskTitle, setTaskTitle] = useState('')
  const [taskReward, setTaskReward] = useState('')
  const [taskType, setTaskType] = useState('public')
  const [minVip, setMinVip] = useState(0)
  const [taskLink, setTaskLink] = useState('')
  const [addingTask, setAddingTask] = useState(false)

  useEffect(() => {
    async function checkAdminAndFetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile || !profile.is_admin) {
        alert('Access Denied! You are not an Admin.')
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)

      // Fetch all users
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (allUsers) setUsers(allUsers)
      setLoading(false)
    }

    checkAdminAndFetchData()
  }, [router])

  // Update User VIP or Balance
  const handleUpdateUser = async (userId, newBalance, newVip) => {
    const { error } = await supabase
      .from('profiles')
      .update({ balance: newBalance, vip_level: newVip })
      .eq('id', userId)

    if (error) {
      alert('Error updating user: ' + error.message)
    } else {
      alert('User updated successfully!')
      setUsers(users.map(u => u.id === userId ? { ...u, balance: newBalance, vip_level: newVip } : u))
    }
  }

  // Create New Task
  const handleCreateTask = async (e) => {
    e.preventDefault()
    setAddingTask(true)

    const { error } = await supabase.from('tasks').insert([
      {
        title: taskTitle,
        reward: parseFloat(taskReward),
        task_type: taskType,
        min_vip_level: parseInt(minVip),
        link: taskLink || '#'
      }
    ])

    if (error) {
      alert('Error creating task: ' + error.message)
    } else {
      alert('New task added successfully!')
      setTaskTitle('')
      setTaskReward('')
      setTaskLink('')
    }
    setAddingTask(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-emerald-400 font-semibold animate-pulse">Checking Admin Access...</p>
      </div>
    )
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pb-20">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-slate-800 rounded-xl text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Admin Control Panel
              </h1>
              <p className="text-xs text-slate-400">Manage users, update VIP tiers, and post new tasks</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: ADD NEW TASK */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New Task
          </h2>

          <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold">Task Title</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Subscribe YouTube Channel"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 mt-1 text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold">Reward ($ USDT)</label>
              <input
                type="number"
                step="0.001"
                required
                value={taskReward}
                onChange={(e) => setTaskReward(e.target.value)}
                placeholder="e.g. 0.05 or 0.50"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 mt-1 text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold">Task Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 mt-1 text-slate-200 focus:outline-none"
              >
                <option value="public">Public (All Users / Free)</option>
                <option value="vip">VIP Exclusive</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold">Min VIP Level Needed</label>
              <select
                value={minVip}
                onChange={(e) => setMinVip(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 mt-1 text-slate-200 focus:outline-none"
              >
                <option value="0">VIP 0 (Free)</option>
                <option value="1">VIP 1 ($5)</option>
                <option value="2">VIP 2 ($10)</option>
                <option value="3">VIP 3 ($25)</option>
                <option value="4">VIP 4 ($50)</option>
                <option value="5">VIP 5 ($100)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-slate-400 font-semibold">Task Link / URL</label>
              <input
                type="text"
                value={taskLink}
                onChange={(e) => setTaskLink(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 mt-1 text-slate-200 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={addingTask}
              className="md:col-span-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition mt-2"
            >
              {addingTask ? 'Publishing Task...' : 'Publish Task'}
            </button>
          </form>
        </div>

        {/* SECTION 2: USER MANAGEMENT */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> User Management ({users.length})
            </h2>

            <div className="relative">
              <input
                type="text"
                placeholder="Search user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none pl-8"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="space-y-3">
            {filteredUsers.map((u) => (
              <UserRow key={u.id} user={u} onUpdate={handleUpdateUser} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function UserRow({ user, onUpdate }) {
  const [balance, setBalance] = useState(user.balance || 0)
  const [vipLevel, setVipLevel] = useState(user.vip_level || 0)

  return (
    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap justify-between items-center gap-3 text-xs">
      <div>
        <p className="font-bold text-slate-200">{user.full_name || 'No Name'}</p>
        <p className="text-[10px] text-slate-500">{user.email}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div>
          <span className="text-[10px] text-slate-500 block">Balance ($)</span>
          <input
            type="number"
            step="0.1"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none text-xs"
          />
        </div>

        <div>
          <span className="text-[10px] text-slate-500 block">VIP Level</span>
          <select
            value={vipLevel}
            onChange={(e) => setVipLevel(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-amber-400 font-bold focus:outline-none text-xs"
          >
            <option value="0">VIP 0</option>
            <option value="1">VIP 1</option>
            <option value="2">VIP 2</option>
            <option value="3">VIP 3</option>
            <option value="4">VIP 4</option>
            <option value="5">VIP 5</option>
          </select>
        </div>

        <button
          onClick={() => onUpdate(user.id, parseFloat(balance), parseInt(vipLevel))}
          className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 font-bold rounded-lg transition text-xs flex items-center gap-1 mt-3"
        >
          <Save className="w-3 h-3" /> Save
        </button>
      </div>
    </div>
  )
}
