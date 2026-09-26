'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Plus,
  Search,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  Wallet,
  DollarSign,
} from 'lucide-react'
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
  const [minVip, setMinVip] = useState('0')
  const [taskLink, setTaskLink] = useState('')
  const [addingTask, setAddingTask] = useState(false)

  useEffect(() => {
    async function loadAdminData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError || !profile || !profile.is_admin) {
          alert('Access Denied! You are not an Admin.')
          router.push('/dashboard')
          return
        }

        const { data: allUsers } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        setUsers(allUsers || [])

        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        setPendingTasks(tasks || [])

        const { data: withdraws } = await supabase
          .from('withdrawals')
          .select('*, profiles(full_name, email)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        setWithdrawals(withdraws || [])

        const { data: depositList } = await supabase
          .from('deposits')
          .select('*, profiles(full_name, email)')
          .order('created_at', { ascending: false })

        setDeposits(depositList || [])
      } catch (error) {
        console.error(error)
        alert('Failed to load admin panel.')
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [router])

  const handleUpdateUser = async (userId, newBalance, newVip) => {
    const balance = Number(newBalance) || 0
    const vip = Number(newVip) || 0

    const { error } = await supabase
      .from('profiles')
      .update({
        balance: balance,
        vip_level: vip,
      })
      .eq('id', userId)

    if (error) {
      alert('Error updating user: ' + error.message)
      return
    }

    setUsers((oldUsers) =>
      oldUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              balance: balance,
              vip_level: vip,
            }
          : user
      )
    )

    alert('User updated successfully!')
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()

    const reward = Number(taskReward)

    if (!taskTitle.trim()) {
      alert('Please enter task title.')
      return
    }

    if (Number.isNaN(reward) || reward < 0) {
      alert('Please enter a valid reward.')
      return
    }

    setAddingTask(true)

    const { error } = await supabase.from('tasks').insert([
      {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        reward: reward,
        task_type: taskType,
        min_vip_level: Number(minVip),
        link: taskLink.trim() || '#',
        status: 'approved',
      },
    ])

    if (error) {
      alert('Error creating task: ' + error.message)
    } else {
      alert('New task added successfully!')

      setTaskTitle('')
      setTaskDescription('')
      setTaskReward('')
      setTaskType('public')
      setMinVip('0')
      setTaskLink('')
    }

    setAddingTask(false)
  }

  const handleTaskStatus = async (taskId, status) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: status })
      .eq('id', taskId)

    if (error) {
      alert('Error updating task: ' + error.message)
      return
    }

    setPendingTasks((oldTasks) =>
      oldTasks.filter((task) => task.id !== taskId)
    )

    alert('Task status updated!')
  }

  const handleWithdrawStatus = async (
    withdrawId,
    userId,
    amount,
    status
  ) => {
    const { error } = await supabase
      .from('withdrawals')
      .update({ status: status })
      .eq('id', withdrawId)

    if (error) {
      alert('Error updating withdrawal: ' + error.message)
      return
    }

    if (status === 'rejected') {
      const user = users.find((item) => item.id === userId)

      if (user) {
        const refundedBalance =
          Number(user.balance || 0) + Number(amount || 0)

        const { error: refundError } = await supabase
          .from('profiles')
          .update({
            balance: refundedBalance,
          })
          .eq('id', userId)

        if (refundError) {
          alert('Refund failed: ' + refundError.message)
          return
        }

        setUsers((oldUsers) =>
          oldUsers.map((item) =>
            item.id === userId
              ? {
                  ...item,
                  balance: refundedBalance,
                }
              : item
          )
        )
      }
    }

    setWithdrawals((oldWithdrawals) =>
      oldWithdrawals.filter((item) => item.id !== withdrawId)
    )

    alert('Withdrawal request updated!')
  }

  const handleDepositAction = async (
    depositId,
    userId,
    amount,
    status
  ) => {
    const { error } = await supabase
      .from('deposits')
      .update({ status: status })
      .eq('id', depositId)

    if (error) {
      alert('Error updating deposit: ' + error.message)
      return
    }

    if (status === 'approved') {
      const user = users.find((item) => item.id === userId)

      if (user) {
        const newBalance =
          Number(user.balance || 0) + Number(amount || 0)

        const { error: balanceError } = await supabase
          .from('profiles')
          .update({
            balance: newBalance,
          })
          .eq('id', userId)

        if (balanceError) {
          alert('Balance update failed: ' + balanceError.message)
          return
        }

        setUsers((oldUsers) =>
          oldUsers.map((item) =>
            item.id === userId
              ? {
                  ...item,
                  balance: newBalance,
                }
              : item
          )
        )
      }
    }

    setDeposits((oldDeposits) =>
      oldDeposits.map((item) =>
        item.id === depositId
          ? {
              ...item,
              status: status,
            }
          : item
      )
    )

    alert('Deposit request updated!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-emerald-400 font-semibold animate-pulse">
          Checking Admin Access...
        </p>
      </div>
    )
  }

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase()

    return (
      (user.email || '').toLowerCase().includes(search) ||
      (user.full_name || '').toLowerCase().includes(search)
    )
  })

  const pendingDeposits = deposits.filter(
    (deposit) => deposit.status === 'pending'
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pb-20">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 bg-slate-800 rounded-xl text-slate-300 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Admin Control Panel
              </h1>

              <p className="text-xs text-slate-400">
                Manage users, deposits, withdrawals, and tasks
              </p>
            </div>
          </div>
        </div>

        {/* DEPOSIT REQUESTS */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            User Deposit Requests ({pendingDeposits.length} Pending)
          </h2>

          {deposits.length === 0 ? (
            <p className="text-xs text-slate-500">
              No deposit requests found.
            </p>
          ) : (
            <div className="space-y-3">
              {deposits.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap justify-between items-center gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <p className="text-slate-300">
                      User:{' '}
                      <span className="text-emerald-400 font-semibold">
                        {item.profiles?.email || 'N/A'}
                      </span>
                    </p>

                    <p className="text-slate-200 font-bold">
                      Amount: ${item.amount || 0} ({item.method || 'N/A'})
                    </p>

                    <p className="text-slate-400">
                      TrxID:{' '}
                      <span className="text-amber-400 font-mono">
                        {item.trx_id || 'N/A'}
                      </span>
                    </p>

                    {item.proof_url && (
                      <a
                        href={item.proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 underline block"
                      >
                        View Screenshot Proof
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleDepositAction(
                              item.id,
                              item.user_id,
                              item.amount,
                              'approved'
                            )
                          }
                          className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDepositAction(
                              item.id,
                              item.user_id,
                              item.amount,
                              'rejected'
                            )
                          }
                          className="px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-lg font-bold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-3 py-1.5 rounded-lg font-bold uppercase text-[10px] ${
                          item.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WITHDRAWAL REQUESTS */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Pending Withdrawal Requests ({withdrawals.length})
          </h2>

          {withdrawals.length === 0 ? (
            <p className="text-xs text-slate-500">
              No pending withdrawal requests right now.
            </p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap justify-between items-center gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-200">
                      {item.profiles?.full_name || 'User'}
                    </p>

                    <p className="text-[10px] text-slate-500">
                      {item.profiles?.email || 'N/A'}
                    </p>

                    <p className="text-emerald-400 font-semibold mt-1">
                      Method:{' '}
                      <span className="text-white uppercase">
                        {item.method || 'N/A'}
                      </span>
                    </p>

                    <p className="text-slate-300">
                      Account:{' '}
                      <span className="text-amber-400 font-mono">
                        {item.account_number || 'N/A'}
                      </span>
                    </p>

                    <p className="text-cyan-400 font-bold mt-1">
                      Amount: $
                      {Number(item.amount || 0).toFixed(2)} USDT
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleWithdrawStatus(
                          item.id,
                          item.user_id,
                          item.amount,
                          'approved'
                        )
                      }
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleWithdrawStatus(
                          item.id,
                          item.user_id,
                          item.amount,
                          'rejected'
                        )
                      }
                      className="px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-lg font-bold flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
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
            <Clock className="w-4 h-4" />
            Pending User Task Requests ({pendingTasks.length})
          </h2>

          {pendingTasks.length === 0 ? (
            <p className="text-xs text-slate-500">
              No pending task requests right now.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap justify-between items-center gap-3 text-xs"
                >
                  <div>
                    <h3 className="font-bold text-slate-200">
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        {task.description}
                      </p>
                    )}

                    <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                      Reward: ${task.reward || 0}
                    </p>

                    {task.link && (
                      <a
                        href={task.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-400 underline block truncate max-w-xs"
                      >
                        {task.link}
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleTaskStatus(task.id, 'approved')
                      }
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleTaskStatus(task.id, 'rejected')
                      }
                      className="px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-lg font-bold flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
         }
                      
