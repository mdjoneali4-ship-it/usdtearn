'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Wallet, Copy, CheckCircle, Info, DollarSign } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function DepositPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState('bkash') // 'bkash', 'nagad', 'rocket', 'usdt'
  const [amount, setAmount] = useState('')
  const [trxId, setTrxId] = useState('')
  const [copied, setCopied] = useState(false)

  // Rate: 1 USDT = 120 BDT
  const USDT_RATE = 120

  // Payment Details
  const paymentDetails = {
    bkash: { type: 'bdt', label: 'bKash Personal', value: '01700000000' },
    nagad: { type: 'bdt', label: 'Nagad Personal', value: '01800000000' },
    rocket: { type: 'bdt', label: 'Rocket Personal', value: '01900000000' },
    usdt: { type: 'usdt', label: 'USDT (TRC20 Address)', value: 'TY1234567890abcdef1234567890' }
  }

  const selectedPayment = paymentDetails[method]

  // Calculate USDT when BDT is entered
  const calculatedUsdt = selectedPayment.type === 'bdt' && amount 
    ? (parseFloat(amount) / USDT_RATE).toFixed(2) 
    : amount ? parseFloat(amount).toFixed(2) : '0.00'

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const numericAmount = parseFloat(amount)
    if (!numericAmount || numericAmount <= 0) {
      return alert('সঠিক পরিমাণ উল্লেখ করুন!')
    }

    if (selectedPayment.type === 'bdt' && numericAmount < 120) {
      return alert('সর্বনিম্ন ডিপোজিট ১২০ টাকা ($1 USDT)')
    }

    if (selectedPayment.type === 'usdt' && numericAmount < 1) {
      return alert('Minimum deposit is $1 USDT')
    }

    if (!trxId) return alert('Transaction ID / TxID প্রদান করুন')

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('অনুগ্রহ করে আগে লগইন করুন')
        return router.push('/login')
      }

      // Insert Deposit Record
      const { error } = await supabase.from('deposits').insert([
        {
          user_id: user.id,
          amount: numericAmount,
          method: method.toUpperCase(),
          trx_id: trxId,
          status: 'pending'
        }
      ])

      if (error) throw error

      alert('ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে! এডমিন যাচাই করে ব্যালেন্স যোগ করে দেবে।')
      router.push('/dashboard')
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 max-w-md mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <Link href="/dashboard" className="p-2 bg-slate-800 rounded-lg text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-lg flex items-center gap-2">
          <Wallet className="text-emerald-400 w-5 h-5" /> Deposit Funds
        </h1>
      </div>

      {/* Info Card */}
      {selectedPayment.type === 'bdt' ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl flex items-center gap-3 text-xs text-emerald-400">
          <Info className="w-5 h-5 shrink-0" />
          <p><span className="font-bold">BDT Rate:</span> $1.00 USDT = {USDT_RATE} BDT। টাকা পাঠালে অটোমেটিক ডলারে রূপান্তর হয়ে একাউন্টে জমা হবে।</p>
        </div>
      ) : (
        <div className="bg-blue-500/10 border border-blue-500/30 p-3.5 rounded-xl flex items-center gap-3 text-xs text-blue-400">
          <DollarSign className="w-5 h-5 shrink-0" />
          <p><span className="font-bold">Crypto Deposit:</span> USDT (TRC20) নেটওয়ার্কে নির্দিষ্ট ঠিকানায় পাঠালে আপনার একাউন্টে সরাসরি USDT জমা হবে।</p>
        </div>
      )}

      {/* Select Method */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
        <label className="text-xs font-semibold text-slate-400 block">পেমেন্ট মেথড সিলেক্ট করুন:</label>
        <div className="grid grid-cols-4 gap-2">
          {['bkash', 'nagad', 'rocket', 'usdt'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMethod(m)
                setAmount('')
              }}
              className={`py-2.5 px-2 rounded-lg text-xs font-bold uppercase transition-all border ${
                method === m
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Selected Payment Details */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400">{selectedPayment.label}:</p>
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <p className="font-mono font-bold text-emerald-400 text-xs truncate">{selectedPayment.value}</p>
            <button
              type="button"
              onClick={() => copyToClipboard(selectedPayment.value)}
              className="flex items-center gap-1 text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300 shrink-0"
            >
              {copied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4 text-xs">
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">
            {selectedPayment.type === 'bdt' ? 'টাকার পরিমাণ (BDT):' : 'পরিমাণ (USDT):'}
          </label>
          <input
            type="number"
            step="any"
            placeholder={selectedPayment.type === 'bdt' ? 'e.g. 600' : 'e.g. 10'}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full bg-slate-950 p-3 rounded-lg border border-slate-800 text-white font-mono focus:border-emerald-500 outline-none"
          />
        </div>

        {/* Conversion Calculation Display */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex justify-between items-center">
          <span className="text-slate-400">একাউন্টে জমা হবে:</span>
          <span className="font-bold text-emerald-400 text-sm font-mono">${calculatedUsdt} USDT</span>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-semibold">
            {selectedPayment.type === 'bdt' ? 'TrxID (বিকাশ/নগদ ট্রানজেকশন আইডি):' : 'TxID / Hash (Crypto Transaction Hash):'}
          </label>
          <input
            type="text"
            placeholder={selectedPayment.type === 'bdt' ? 'e.g. 9J87X6Y5Z' : 'e.g. 0x123...abc'}
            value={trxId}
            onChange={(e) => setTrxId(e.target.value)}
            required
            className="w-full bg-slate-950 p-3 rounded-lg border border-slate-800 text-white font-mono focus:border-emerald-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-black py-3 rounded-xl font-bold transition-all disabled:opacity-50"
        >
          {loading ? 'জমা হচ্ছে...' : 'Submit Deposit'}
        </button>
      </form>
    </div>
  )
          }
