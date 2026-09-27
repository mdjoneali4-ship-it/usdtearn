'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, History, ArrowDownLeft, ArrowUpRight, CheckCircle, Clock, XCircle, ListChecks } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function HistoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('deposits') // 'deposits', 'withdrawals', 'tasks'
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])

  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return router.push('/login')
      }

      // Fetch Deposits
      const { data: depData } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (depData) setDeposits(depData)

      // Fetch Withdrawals
      const { data: withData } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (withData) setWithdrawals(withData)

      // Fetch Completed Tasks (if user_tasks table exists)
      const { data: taskData } = await supabase
        .from('user_tasks')
        .select('*, tasks(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (taskData) setCompletedTasks(taskData)

    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
      case 'paid':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        )
      case 'rejected':
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Pending
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 flex items-center justify-center text-xs">
        Loading History...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 max-w-md mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <Link href="/dashboard" className="p-2 bg-slate-800 rounded-lg text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-lg flex items-center gap-2">
          <History className="text-emerald-400 w-5 h-5" /> Transaction History
        </h1>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('deposits')}
          className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'deposits'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5" /> Deposits
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'withdrawals'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" /> Cashouts
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'tasks'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ListChecks className="w-3.5 h-3.5" /> Tasks
        </button>
      </div>

      {/* Content Lists */}
      <div className="space-y-3">
        {/* DEPOSITS HISTORY */}
        {activeTab === 'deposits' && (
          deposits.length === 0 ? (
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
              Kono deposit history ney.
            </div>
          ) : (
            deposits.map((item) => (
              <div key={item.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 uppercase">{item.method || 'Deposit'}</p>
                      <p className="text-[10px] text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg font-mono text-[11px]">
                  <span className="text-slate-400">Amount:</span>
                  <span className="font-bold text-emerald-400">{item.amount} {item.method?.toLowerCase().includes('usdt') ? 'USDT' : 'BDT'}</span>
                </div>
                {item.trx_id && (
                  <p className="text-[10px] text-slate-400 font-mono">TrxID: {item.trx_id}</p>
                )}
              </div>
            ))
          )
        )}

        {/* WITHDRAWALS HISTORY */}
        {activeTab === 'withdrawals' && (
          withdrawals.length === 0 ? (
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
              Kono cashout/withdrawal history ney.
            </div>
          ) : (
            withdrawals.map((item) => (
              <div key={item.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 uppercase">{item.method || 'Cashout'}</p>
                      <p className="text-[10px] text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg font-mono text-[11px]">
                  <span className="text-slate-400">Amount:</span>
                  <span className="font-bold text-rose-400">${item.amount} USDT</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">Account: {item.account_number}</p>
              </div>
            ))
          )
        )}

        {/* TASKS HISTORY */}
        {activeTab === 'tasks' && (
          completedTasks.length === 0 ? (
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
              Kono task history ney.
            </div>
          ) : (
            completedTasks.map((item) => (
              <div key={item.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                      <ListChecks className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">{item.tasks?.title || 'Task Completed'}</p>
                      <p className="text-[10px] text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {getStatusBadge(item.status || 'approved')}
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg font-mono text-[11px]">
                  <span className="text-slate-400">Reward Earned:</span>
                  <span className="font-bold text-emerald-400">+${item.reward || item.tasks?.reward || '0.00'} USDT</span>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  )
                  }
