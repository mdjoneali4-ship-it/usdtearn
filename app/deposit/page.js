'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Image as ImageIcon, Wallet, History, CheckCircle2, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function DepositPage() {
  const [profile, setProfile] = useState(null)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('bKash')
  const [trxId, setTrxId] = useState('')
  const [proofFile, setProofFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [deposits, setDeposits] = useState([])

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(userProfile)

        // Fetch user's deposit history
        const { data: userDeposits } = await supabase
          .from('deposits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (userDeposits) setDeposits(userDeposits)
      }
    }
    loadData()
  }, [])

  const handleDepositSubmit = async (e) => {
    e.preventDefault()
    if (!profile) return
    setLoading(true)

    let proofUrl = ''

    // Upload screenshot if provided
    if (proofFile) {
      const fileExt = proofFile.name.split('.').pop()
      const fileName = `deposit_${profile.id}_${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('deposit-proofs')
        .upload(fileName, proofFile)

      if (uploadError) {
        alert('Error uploading screenshot: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: publicURLData } = supabase.storage
        .from('deposit-proofs')
        .getPublicUrl(fileName)

      proofUrl = publicURLData.publicUrl
    }

    const { error } = await supabase.from('deposits').insert([
      {
        user_id: profile.id,
        amount: parseFloat(amount),
        method,
        trx_id: trxId,
        proof_url: proofUrl,
        status: 'pending'
      }
    ])

    if (error) {
      alert('Deposit failed: ' + error.message)
    } else {
      alert('Deposit request submitted successfully! Please wait for approval.')
      setAmount('')
      setTrxId('')
      setProofFile(null)
      // Reload history
      window.location.reload()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-slate-800 rounded-xl text-slate-300 hover:bg-slate-700 transition">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-100">Deposit Funds</h1>
              <p className="text-xs text-slate-400">Add balance to your account securely</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-emerald-400 text-xs font-bold">
            <Wallet className="w-4 h-4" /> Balance: ${profile?.balance || 0}
          </div>
        </div>

        {/* Payment Info Box */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <h2 className="text-sm font-bold text-slate-200">Payment Instructions</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Please send money to our official merchant/personal account below and submit your Transaction ID & Screenshot here.
          </p>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
            <p className="text-slate-300"><span className="text-slate-500">bKash / Nagad (Personal):</span> <strong className="text-emerald-400">01700000000</strong></p>
            <p className="text-slate-300"><span className="text-slate-500">USDT (TRC20):</span> <strong className="text-emerald-400">TQxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</strong></p>
          </div>
        </div>

        {/* Deposit Form */}
        <form onSubmit={handleDepositSubmit} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200">Deposit Form</h2>

          <div>
            <label className="text-xs font-semibold text-slate-300">Select Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
            >
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="USDT">USDT (TRC20)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Amount (USD / BDT)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount..."
              className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Transaction ID (TrxID)</label>
            <input
              type="text"
              required
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="Enter transaction ID..."
              className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Payment Screenshot
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setProofFile(e.target.files[0])}
              className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-600 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 mt-2"
          >
            <Send className="w-4 h-4" /> {loading ? 'Submitting Request...' : 'Submit Deposit Request'}
          </button>
        </form>

        {/* Deposit History */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" /> Deposit History
          </h2>

          <div className="space-y-2">
            {deposits.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No deposit history found.</p>
            ) : (
              deposits.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-200">${item.amount} <span className="text-[10px] text-slate-400 font-normal">({item.method})</span></p>
                    <p className="text-[10px] text-slate-500">TrxID: {item.trx_id}</p>
                  </div>
                  <div>
                    {item.status === 'approved' ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
                }
                                          
