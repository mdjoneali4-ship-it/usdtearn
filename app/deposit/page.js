'use client'
import { useState } from 'react'
import { Wallet, Copy, CheckCircle2 } from 'lucide-react'

export default function Deposit() {
  const [copied, setCopied] = useState(false)
  const [method, setMethod] = useState('bkash')

  const adminNumbers = {
    bkash: '01800000000 (Personal)',
    nagad: '01700000000 (Personal)',
    usdt: '0x1234567890abcdef1234567890abcdef12345678 (TRC20)'
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pb-20">
      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-emerald-400" /> Deposit Balance
        </h1>
        <p className="text-xs text-slate-400 mb-6">Rate: 1 USDT = 120 BDT</p>

        {/* Payment Select */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {['bkash', 'nagad', 'usdt'].map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`p-3 rounded-xl border text-sm font-semibold capitalize transition ${
                method === m ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-950 text-slate-400'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl mb-6">
          <span className="text-xs text-slate-400 block mb-1">Admin Account/Address ({method.toUpperCase()}):</span>
          <div className="flex items-center justify-between font-mono text-sm bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <span>{adminNumbers[method]}</span>
            <button onClick={() => handleCopy(adminNumbers[method])} className="text-emerald-400 hover:text-emerald-300">
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Amount Sent (BDT / USDT)</label>
            <input type="number" placeholder="e.g. 500 BDT or 5 USDT" className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Sender Phone / Wallet Address</label>
            <input type="text" placeholder="017XXXXXXXX / Wallet" className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Transaction ID (TrxID)</label>
            <input type="text" placeholder="e.g. 9J82KLS72" className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
          </div>

          <button type="button" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition">
            Submit Deposit Proof
          </button>
        </form>
      </div>
    </div>
  )
}
