'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Plus, Save, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [pendingTasks, setPendingTasks] = useState([])
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])

  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskReward, setTaskReward] = useState('')
  const [taskLink, setTaskLink] = useState('')
  const [taskVip, setTaskVip] = useState(0)

  // 1 USDT = 120 BDT
  const BDT_RATE = 120

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (!profile?.is_admin) return router.push('/dashboard')

      // Fetch Users
      const { data: u } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (u) setUsers(u)

      // Fetch Pending Tasks
      const { data: t } = await supabase.from('tasks').select('*').eq('status', 'pending')
      if (t) setPendingTasks(t)

      // Fetch Deposits
      const { data: d } = await supabase.from('deposits').select('*').eq('status', 'pending').order('created_at', { ascending: false })
      if (d) setDeposits(d)

      // Fetch Withdrawals
      const { data: w } = await supabase.from('withdrawals').select('*').eq('status', 'pending').order('created_at', { ascending: false })
      if (w) setWithdrawals(w)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveDeposit = async (dep) => {
    try {
      const { data: userProfile, error: userErr } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', dep.user_id)
        .single()

      if (userErr) throw userErr

      const currentBalance = Number(userProfile?.balance || 0)
      const rawAmount = Number(dep.amount || 0)
      
      const addedUsdt = dep.method && dep.method.toLowerCase().includes('usdt') 
        ? rawAmount 
        : (rawAmount / BDT_RATE)
        
      const newBalance = currentBalance + addedUsdt

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ balance: parseFloat(newBalance.toFixed(2)) })
        .eq('id', dep.user_id)

      if (updateErr) throw updateErr

      await supabase.from('deposits').update({ status: 'approved' }).eq('id', dep.id)

      alert(`Deposit Approved! Added $${addedUsdt.toFixed(2)} USDT. New Balance: $${newBalance.toFixed(2)}`)
      fetchData()
    } catch (err) {
      alert('Error approving deposit: ' + err.message)
    }
  }

  const handleRejectDeposit = async (id) => {
    await supabase.from('deposits').update({ status: 'rejected' }).eq('id', id)
    alert('Deposit Rejected!')
    fetchData()
  }

  const handleApproveWithdrawal = async (id) => {
    await supabase.from('withdrawals').update({ status: 'approved' }).eq('id', id)
    alert('Withdrawal Marked Paid!')
    fetchData()
  }

  const handleRejectWithdrawal = async (w) => {
    try {
      const { data: userProfile } = await supabase.from('profiles').select('balance').eq('id', w.user_id).single()
      const currentBal = Number(userProfile?.balance || 0)
      const refundUsdt = Number(w.amount || 0)
      const refundedBal = currentBal + refundUsdt

      await supabase.from('profiles').update({ balance: parseFloat(refundedBal.toFixed(2)) }).eq('id', w.user_id)
      await supabase.from('withdrawals').update({ status: 'rejected' }).eq('id', w.id)
      alert('Withdrawal Rejected & Refunded!')
      fetchData()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleTaskStatus = async (id, status) => {
    await supabase.from('tasks').update({ status }).eq('id', id)
    alert(`Task ${status}!`)
    fetchData()
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    
    const { error } = await supabase.from('tasks').insert([
      { 
        title: taskTitle, 
        description: taskDescription, 
        reward: parseFloat(taskReward || 0), 
        link: taskLink || '#', 
        min_vip: parseInt(taskVip || 0), 
        status: 'approved' 
      }
    ])

    if (error) {
      alert('Failed to save task: ' + error.message)
      console.error(error)
    } else {
      alert('Task Created Successfully!')
      setTaskTitle(''); setTaskDescription(''); setTaskReward(''); setTaskLink(''); setTaskVip(0)
      fetchData()
    }
  }

  const handleUpdateUser = async (id, balance, vip_level) => {
    await supabase.from('profiles').update({ balance: parseFloat(balance), vip_level: parseInt(vip_level) }).eq('id', id)
    alert('User Updated!')
    fetchData()
  }

  if (loading) return <div className="min-h-screen bg-slate-950 text-white p-4 flex items-center justify-center">Loading Admin...</div>

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-xl">
        <Link href="/dashboard" className="p-2 bg-slate-800 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="font-bold flex items-center gap-2"><ShieldCheck className="text-emerald-400" /> Admin Control</h1>
      </div>

      {/* DEPOSITS */}
      <div className="bg-slate-900 p-4 rounded-xl space-y-3">
        <h2 className="font-bold text-emerald-400 flex items-center gap-1 text-sm"><ArrowDownLeft className="w-4 h-4" /> Deposits ({deposits.length})</h2>
        {deposits.length === 0 ? (
          <p className="text-xs text-slate-500">No pending deposits</p>
        ) : (
          deposits.map(d => {
            const userObj = users.find(u => u.id === d.user_id)
            return (
              <div key={d.id} className="p-3 bg-slate-950 rounded-lg flex flex-wrap justify-between items-center text-xs gap-2">
                <div>
                  <p className="font-bold text-slate-200">{userObj?.full_name || 'User'} ({userObj?.email || d.user_id})</p>
                  <p className="text-emerald-400 font-bold">Amount: {d.amount} ({d.method || 'BDT'})</p>
                  <p className="text-slate-400 text-[11px]">Trx: {d.trx_id}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApproveDeposit(d)} className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded font-bold">Approve</button>
                  <button onClick={() => handleRejectDeposit(d.id)} className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded font-bold">Reject</button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* WITHDRAWALS */}
      <div className="bg-slate-900 p-4 rounded-xl space-y-3">
        <h2 className="font-bold text-rose-400 flex items-center gap-1 text-sm"><ArrowUpRight className="w-4 h-4" /> Withdrawals ({withdrawals.length})</h2>
        {withdrawals.length === 0 ? (
          <p className="text-xs text-slate-500">No pending withdrawals</p>
        ) : (
          withdrawals.map(w => {
            const userObj = users.find(u => u.id === w.user_id)
            return (
              <div key={w.id} className="p-3 bg-slate-950 rounded-lg flex flex-wrap justify-between items-center text-xs gap-2">
                <div>
                  <p className="font-bold text-slate-200">{userObj?.full_name || 'User'} ({userObj?.email || w.user_id})</p>
                  <p className="text-rose-400 font-bold">${w.amount} USDT</p>
                  <p className="text-slate-400 text-[11px]">Acc: {w.account_number} ({w.method})</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApproveWithdrawal(w.id)} className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded font-bold">Paid</button>
                  <button onClick={() => handleRejectWithdrawal(w)} className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded font-bold">Refund</button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* PENDING TASKS */}
      <div className="bg-slate-900 p-4 rounded-xl space-y-3">
        <h2 className="font-bold text-amber-400 text-sm">Pending Tasks ({pendingTasks.length})</h2>
        {pendingTasks.map(t => (
          <div key={t.id} className="p-3 bg-slate-950 rounded-lg flex justify-between items-center text-xs gap-2">
            <p className="font-bold">{t.title} (${t.reward})</p>
            <div className="flex gap-2">
              <button onClick={() => handleTaskStatus(t.id, 'approved')} className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Approve</button>
              <button onClick={() => handleTaskStatus(t.id, 'rejected')} className="bg-rose-500/20 text-rose-400 px-2 py-1 rounded">Reject</button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE TASK FORM */}
      <form onSubmit={handleCreateTask} className="bg-slate-900 p-4 rounded-xl space-y-3 text-xs">
        <h2 className="font-bold text-emerald-400 flex items-center gap-1"><Plus className="w-4 h-4" /> Create New Task</h2>
        
        <div>
          <label className="text-[11px] text-slate-400 mb-1 block">Task Title</label>
          <input 
            placeholder="Ex: Subscribe YouTube Channel" 
            value={taskTitle} 
            onChange={e => setTaskTitle(e.target.value)} 
            required 
            className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white" 
          />
        </div>

        <div>
          <label className="text-[11px] text-slate-400 mb-1 block">Task Description / Instructions</label>
          <textarea 
            placeholder="Ex: Subscribe channel and take a screenshot..." 
            value={taskDescription} 
            onChange={e => setTaskDescription(e.target.value)} 
            rows={3}
            className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white resize-none" 
          />
        </div>

        <div>
          <label className="text-[11px] text-slate-400 mb-1 block">Reward ($ USDT)</label>
          <input 
            placeholder="Ex: 0.05" 
            type="number" 
            step="0.01" 
            value={taskReward} 
            onChange={e => setTaskReward(e.target.value)} 
            required 
            className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white" 
          />
        </div>

        <div>
          <label className="text-[11px] text-slate-400 mb-1 block">Target VIP Level</label>
          <select 
            value={taskVip} 
            onChange={e => setTaskVip(e.target.value)} 
            className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-amber-400 font-bold"
          >
            <option value="0">VIP 0 (All Users)</option>
            <option value="1">VIP 1 Only</option>
            <option value="2">VIP 2 Only</option>
            <option value="3">VIP 3 Only</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 mb-1 block">Task Link (URL)</label>
          <input 
            placeholder="https://..." 
            value={taskLink} 
            onChange={e => setTaskLink(e.target.value)} 
            className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-white" 
          />
        </div>

        <button type="submit" className="w-full bg-emerald-500 text-black py-2.5 rounded-lg font-bold hover:bg-emerald-400 transition">
          Publish Task
        </button>
      </form>

      {/* USER MANAGEMENT */}
      <div className="bg-slate-900 p-4 rounded-xl space-y-3 text-xs">
        <h2 className="font-bold">Users ({users.length})</h2>
        {users.map(u => (
          <UserCard key={u.id} user={u} onSave={handleUpdateUser} />
        ))}
      </div>
    </div>
  )
}

function UserCard({ user, onSave }) {
  const [b, setB] = useState(user.balance || 0)
  const [v, setV] = useState(user.vip_level || 0)

  return (
    <div className="p-3 bg-slate-950 rounded-lg flex flex-wrap justify-between items-center gap-2">
      <div>
        <p className="font-bold text-slate-200">{user.full_name || 'User'}</p>
        <p className="text-slate-500 text-[10px]">{user.email}</p>
      </div>
      <div className="flex items-center gap-2">
        <input type="number" step="0.01" value={b} onChange={e => setB(e.target.value)} className="w-16 bg-slate-900 p-1 rounded border border-slate-800 text-white" />
        <select value={v} onChange={e => setV(e.target.value)} className="bg-slate-900 p-1 rounded border border-slate-800 text-amber-400 font-bold">
          <option value="0">VIP 0</option>
          <option value="1">VIP 1</option>
          <option value="2">VIP 2</option>
          <option value="3">VIP 3</option>
        </select>
        <button onClick={() => onSave(user.id, b, v)} className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold"><Save className="w-3 h-3" /></button>
      </div>
    </div>
  )
}
