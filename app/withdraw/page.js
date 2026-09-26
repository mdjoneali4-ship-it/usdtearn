'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'

export default function Withdraw() {
  const router = useRouter()
  const [method, setMethod] = useState('bKash')
  const [amount, setAmount] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [loading, setLoading] = useState(false)

  const handleWithdraw = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      alert('Withdrawal request submitted successfully! Pending approval.')
      setLoading(false)
      router.push('/dashboard')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 bg-slate-800 rounded-xl text-slate-300">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg font-bold text-emerald-400">Withdraw Funds</h1>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Select Method</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => setMethod('bKash')}
                className={`py-2.5 text-xs font-bold rounded-xl border ${method === 'bKash' ? 'bg-pink-600/20 border-pink-500 text-pink-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
              >
                bKash
              </button>
              <button
                type="button"
                onClick={() => setMethod('Nagad')}
                className={`py-2.5 text-xs font-bold rounded-xl border ${method === 'Nagad' ? 'bg-orange-600/20 border-orange-500 text-orange-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
              >
                Nagad
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Account Number</label>
            <input
              type="text"
              required
              placeholder="01700000000"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Amount ($ USDT)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="10.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
    }
    
