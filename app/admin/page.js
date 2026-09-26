'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, ShieldCheck, Plus, Search, Save, CheckCircle, XCircle, Clock, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [pendingTasks, setPendingTasks] = useState([])
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskReward, setTaskReward] = useState('')
  const [taskType, setTaskType] = useState('public')
  const [minVip, setMinVip] = useState(0)
  const [taskLink, setTaskLink] = useState('')
  const [addingTask, setAddingTask] = useState(false)

  useEffect(() => {
    fetchAdminData()
  }, [])

  async function fetchAdminData() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (!profile || !profile.is_admin) {
        alert('Access Denied! You are not an Admin.')
        router.push('/dashboard')
        return
      }

      // Fetch Users safely
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (allUsers) setUsers(allUsers)

      // Fetch Tasks safely
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending')
      if (tasksData) setPendingTasks(tasksData)

      // Fetch Deposits safely
      try {
        const { data: depositsData } = await supabase
          .from('deposits')
          .select('*, profiles(full_name, email, balance)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
        if (depositsData) setDeposits(depositsData)
      } catch (e) {
        console.warn('Deposits table not ready yet')
      }

      // Fetch Withdrawals safely
      try {
        const { data: withdrawalsData } = await supabase
          .from('withdrawals')
          .select('*, profiles(full_name, email, balance)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
        if (withdrawalsData) setWithdrawals(withdrawalsData)
      } catch (e) {
        console.warn('Withdrawals table not ready yet')
      }

    } catch (err) {
      console.error("Admin fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  // --- DEPOSIT ACCEPT LOGIC ---
  const handleApproveDeposit = async (deposit) => {
    try {
      const currentBalance = Number(deposit.profiles?.balance || 0)
      const newBalance = currentBalance + Number(deposit.amount || 0)

      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', deposit.user_id)

      if (balanceError) throw balanceError

      const { error: depositError } = await supabase
        .from('deposits')
        .update({ status: 'approved' })
        .eq('id', deposit.id)

      if (depositError) throw depositError

      alert(`Deposit of $${deposit.amount} approved successfully!`)
      setDeposits(deposits.filter(d => d.id !== deposit.id))
      setUsers(users.map(u => u.id === deposit.user_id ? { ...u, balance: newBalance } : u))
    } catch (err) {
      alert('Error approving deposit: ' + err.message)
    }
  }

  const handleRejectDeposit = async (depositId) => {
    const { error } = await supabase
      .from('deposits')
      .update({ status: 'rejected' })
      .eq('id', depositId)

    if (error) {
      alert('Error rejecting deposit: ' + error.message)
    } else {
      alert('Deposit rejected.')
      setDeposits(deposits.filter(d => d.id !== depositId))
    }
  }

  // --- WITHDRAWAL APPROVE LOGIC ---
  const handleApproveWithdrawal = async (withdrawalId) => {
    const { error } = await supabase
      .from('withdrawals')
      .update({ status: 'approved' })
      .eq('id', withdrawalId)

    if (error) {
      alert('Error approving withdrawal: ' + error.message)
    } else {
      alert('Withdrawal request marked as completed!')
      setWithdrawals(withdrawals.filter(w => w.id !== withdrawalId))
    }
  }

  const handleRejectWithdrawal = async (withdrawal) => {
    try {
      const currentBalance = Number(withdrawal.profiles?.balance || 0)
      const refundedBalance = currentBalance + Number(withdrawal.amount || 0)

      await supabase
        .from('profiles')
        .update({ balance: refundedBalance })
        .eq('id', withdrawal.user_id)

      await supabase
        .from('withdrawals')
        .update({ status: 'rejected' })
        .eq('id', withdrawal.id)

      alert('Withdrawal rejected and balance refunded.')
      setWithdrawals(withdrawals.filter(w => w.id !== withdrawal.id))
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

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

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setAddingTask(true)

    const { error } = await supabase.from('tasks').insert([
      {
        title: taskTitle,
        description: taskDescription,
        reward: parseFloat(taskReward || 0),
        task_type: taskType,
        min_vip_level: parseInt(minVip || 0),
        link: taskLink || '#',
        status: 'approved'
      }
    ])

    if (error) {
      alert('Error creating task: ' + error.message)
    } else {
      alert('New task added successfully!')
      setTaskTitle('')
      setTaskDescription('')
      setTaskReward('')
      setTaskLink('')
    }
    setAddingTask(false)
  }

  const handleTaskStatus = async (taskId, newStatus) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) {
      alert('Error updating task: ' + error.message)
    } else {
      alert('Task status updated!')
      setPendingTasks(pendingTasks.filter(t => t.id !== taskId))
    }
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
        
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-slate-800 rounded-xl text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Admin Control Panel
              </h1>
              <p className="text-xs text-slate-400">Manage users, deposits, and withdrawals</p>
            </div>
          </div>
        </div>

        {/* PENDING DEPOSITS */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4" /> Deposit Requests ({deposits.length})
          </h2>

          {deposits.length === 0 ? (
            <p className="text-xs text-slate-500">No pending deposit requests.</p>
          ) : (
            <div className="space-y-3">
              {deposits.map((d) => (
                <div key={d.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap justify-between items-center gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-200">{d.profiles?.full_name || 'User'} ({d.profiles?.email || 'N/A'})</p>
                    <p className="text-emerald-400 font-bold mt-0.5">Amount: ${d.amount} USDT</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Trx ID: <span className="text-slate-200 font-mono">{d.trx_id}</span> | Method: {d.method}</p>
                    {d.proof_url && (
                      <a href={d.proof_url} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 underline block mt-0.5">
                        View Payment Proof
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveDeposit(d)}
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg font-bold flex items-center gap-1 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Accept Deposit
                    </button>
                    <button
                      onClick={() => handleRejectDeposit(d.id)}
                      className="px-3 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg font-bold flex items-center gap-1 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PENDING WITHDRAWALS */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4" /> Withdrawal Requests ({withdrawals.length})
          </h2>

          {withdrawals.length === 0 ? (
            <p className="text-xs text-slate-500">No pending withdrawal requests.</p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div key={w.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap justify-between items-center gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-200">{w.profiles?.full_name || 'User'} ({w.profiles?.email || 'N/A'})</p>
                    <p className="text-rose-400 font-bold mt-0.5">Amount: ${w.amount} USDT</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Account: <span className="text-slate-200 font-mono">{w.account_number}</span> ({w.method})</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveWithdrawal(w.id)}
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg font-bold flex items-center gap-1 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Paid
                    </button>
                    <button
                      onClick={() => handleRejectWithdrawal(w)}
                      className="px-3 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg font-bold flex items-center gap-1 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject & Refund
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PENDING TASKS */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Pending User Tasks ({pendingTasks.length})
          </h2>

          {pendingTasks.length === 0 ? (
            <p className="text-xs text-slate-500">No pending task requests right now.</p>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((t) => (
                <div key={t.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap justify-between items-center gap-3 text-xs">
                  <div>
                    <h3 className="font-bold text-slate-200">{t.title}</h3>
                    {t.description && <p className="text-[11px] text-slate-400 mt-0.5">{t.description}</p>}
                    <p className="text-[10px] text-emerald-400 font-semibold mt-1">Reward: ${t.reward}</p>
                    <a href={t.link} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 underline truncate block max-w-xs mt-0.5">
                      {t.link}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTaskStatus(t.id, 'approved')}
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg font-bold flex items-center gap-1 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleTaskStatus(t.id, 'rejected')}
                      className="px-3 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg font-bold flex items-center gap-1 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ADD TASK */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Admin Task
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
                placeholder="e.g. 0.05"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 mt-1 text-slate-200 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-slate-400 font-semibold">Task Description</label>
              <textarea
                rows="3"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Explain instructions..."
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
              <label className="text-slate-400 font-semibold">Min VIP Level</label>
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
              <label className="text-slate-400 font-semibold">Task Link</label>
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

        {/* USER MANAGEMENT */}
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

            
