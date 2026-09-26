'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, ShieldCheck, Plus, Search, Save, CheckCircle, XCircle, Clock, Wallet, DollarSign } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [pendingTasks, setPendingTasks] = useState([])
  const [withdrawals, setWithdrawals] = useState([]) 
  const [deposits, setDeposits] = useState([]) 
  const [searchTerm, setSearchTerm] = useState('')
  
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
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

      const { data: allUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (allUsers) setUsers(allUsers)

      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending')

      if (tasksData) setPendingTasks(tasksData)

      const { data: withdrawData } = await supabase
        .from('withdrawals')
        .select('*, profiles(full_name, email)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (withdrawData) setWithdrawals(withdrawData)

      const { data: depositData } = await supabase
        .from('deposits')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })

      if (depositData) setDeposits(depositData)

      setLoading(false)
    }

    checkAdminAndFetchData()
  }, [router])

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
        reward: parseFloat(taskReward),
        task_type: taskType,
        min_vip_level: parseInt(minVip),
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

  const handleWithdrawStatus = async (withdrawId, userId, amount, status) => {
    const { error: updateError } = await supabase
      .from('withdrawals')
      .update({ status: status })
      .eq('id', withdrawId)

    if (updateError) {
      alert('Error updating withdrawal: ' + updateError.message)
      return
    }

    if (status === 'rejected') {
      const targetUser = users.find(u => u.id === userId)
      if (targetUser) {
        const refundedBalance = (targetUser.balance || 0) + amount
        await supabase
          .from('profiles')
          .update({ balance: refundedBalance })
          .eq('id', userId)

        setUsers(users.map(u => u.id === userId ? { ...u, balance: refundedBalance } : u))
      }
    }

    alert('Withdrawal request updated!')
    setWithdrawals(withdrawals.filter(w => w.id !== withdrawId))
  }

  const handleDepositAction = async (depositId, userId, amount, status) => {
    const { error: updateError } = await supabase
      .from('deposits')
      .update({ status: status })
      .eq('id', depositId)

    if (updateError) {
      alert('Error updating deposit: ' + updateError.message)
      return
    }

    if (status === 'approved') {
      const targetUser = users.find(u => u.id === userId)
      if (targetUser) {
        const newBalance = parseFloat((targetUser.balance || 0) + parseFloat(amount)).toFixed(4)
        await supabase
          .from('profiles')
          .update({ balance: parseFloat(newBalance) })
          .eq('id', userId)

        setUsers(users.map(u => u.id === userId ? { ...u, balance: parseFloat(newBalance) } : u))
      }
    }

    alert('Deposit request updated!')
    setDeposits(deposits.map(d => d.id === depositId ? { ...d, status } : d))
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

  const pendingDeposits = deposits.filter(d => d.status === 'pending')

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
              <p className="text-xs text-slate-400">Manage users, deposits, withdrawals, and tasks</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: DEPOSIT REQUESTS */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> User Deposit Requests ({pendingDeposits.length} Pending)
          </h2>

          {deposits.length === 0 ? (
            <p className="text-xs text-slate-500">No deposit requests found.</p>
          ) : (
            <div className="space-y-3">
              {deposits.map((item) => (
                <div key={item.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap justify-between items-center gap-3 text-xs">
                  <div className="space-y-1">
                    <p className="text-slate-300">User: <span className="text-emerald-400 font-semibold">{item.profiles?.email || 'N/A'}</span></p>
                    <p className="text-slate-200 font-bold">Amount: ${item.amount} ({item.method})</p>
                    <p className="text-slate-400">TrxID: <span className="text-amber-400 font-mono">{item.trx_id}</span></p>
                    {item.proof_url && (
                      <a href={item.proof_url} target="_blank" rel="noreferrer" className="text-blue-400 underline block pt-0.5">
                        View Screenshot Proof
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleDepositAction(item.id, item.user_id, item.amount, 'approved')}
                          className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg font-bold flex items-center gap-1 transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleDepositAction(item.id, item.user_id, item.amount, 'rejected')}
                          className="px-3 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg font-bold flex items-center gap-1 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    ) : (
                      <span className={`px-3 py-1.5 rounded-lg font-bold uppercase text-[10px] ${
                        item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: PENDING WITHDRAWAL REQUESTS */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Pending Withdrawal Requests ({withdrawals.length})
          </h2>

          {withdrawals.length === 0 ? (
            <p className="text-xs text-slate-500">No pending withdrawal requests right now.</p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div key={w.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap justify-between items-center gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-200">{w.profiles?.full_name || 'User'} <span className="text-[10px] text-slate-500">({w.profiles?.email})</span></p>
                    <p className="text-emerald-400 font-semibold mt-0.5">Method: <span className="uppercase text-white">{w.method}</span></p>
                    <p className="text-slate-300">Account/Address: <span className="text-amber-400 font-mono">{w.account_number}</span></p>
                    <p className="text-cyan-400 font-bold mt-1">Amount: ${w.amount.toFixed(2)} USDT</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleWithdrawStatus(w.id, w.user_id, w.amount, 'approved')}
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg font-bold flex items-center gap-1 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleWithdrawStatus(w.id, w.user_id, w.amount, 'rejected')}
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

        {/* SECTION 3: PENDING USER SUBMITTED TASKS */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Pending User Task Requests ({pendingTasks.length})
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

        {/* SECTION 4: ADD NEW TASK (DIRECT) */}
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
              <label className="text-slate-400 font-semibold">Task Description / Instructions</label>
              <textarea
                rows="3"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Explain step-by-step instructions..."
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

        {/* SECTION 5: USER MANAGEMENT */}
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
    <div className="p-3.5 bg-slate-950 border border-slate-8
