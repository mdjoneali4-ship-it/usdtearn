'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Withdraw() {
  const router = useRouter()
  const [method, setMethod] = useState('bKash')
  const [network, setNetwork] = useState('TRC20') // ক্রিপ্টো নেটওয়ার্কের জন্য স্টেট
  const [amount, setAmount] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [loading, setLoading] = useState(false)

  // এক্সচেঞ্জ রেট: ১ ডলার = ১২০ টাকা (আপনার প্রয়োজন মত পরিবর্তন করতে পারেন)
  const BDT_TO_USD_RATE = 120

  const handleWithdraw = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please login first!')
        router.push('/login')
        return
      }

      // ১. ইউজারের কারেন্ট ব্যালেন্স চেক করা
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        alert('Error fetching user profile.')
        setLoading(false)
        return
      }

      const inputAmount = parseFloat(amount)
      let withdrawAmountUSD = 0
      let finalDestination = accountNumber

      if (isNaN(inputAmount) || inputAmount <= 0) {
        alert('Please enter a valid amount.')
        setLoading(false)
        return
      }

      // ২. মেথড অনুযায়ী লিমিট এবং অ্যামাউন্ট ক্যালকুলেশন
      if (method === 'bKash' || method === 'Nagad') {
        if (inputAmount < 200 || inputAmount > 2500) {
          alert(`For ${method}, withdrawal amount must be between 200 BDT and 2,500 BDT.`)
          setLoading(false)
          return
        }
        // টাকা থেকে ডলারে কনভার্ট করা (যেহেতু সিস্টেমের ব্যালেন্স ডলারে থাকে)
        withdrawAmountUSD = inputAmount / BDT_TO_USD_RATE
      } else if (method === 'USDT') {
        if (inputAmount < 5 || inputAmount > 100) {
          alert('For USDT, withdrawal amount must be between $5 and $100.')
          setLoading(false)
          return
        }
        withdrawAmountUSD = inputAmount
        finalDestination = `${accountNumber} (${network})` // ওয়ালেট এড্রেস ও নেটওয়ার্ক একসাথে সেভ করার জন্য
      }

      // ৩. পর্যাপ্ত ব্যালেন্স আছে কিনা চেক করা
      if (profile.balance < withdrawAmountUSD) {
        alert(`Insufficient balance! You need at least $${withdrawAmountUSD.toFixed(2)} USD equivalent.`)
        setLoading(false)
        return
      }

      // ৪. ডেটাবেজে উইথড্র রিকোয়েস্ট সেভ করা
      const { error: withdrawError } = await supabase.from('withdrawals').insert([
        {
          user_id: user.id,
          method: method === 'USDT' ? `USDT (${network})` : method,
          account_number: finalDestination,
          amount: withdrawAmountUSD, // ডেটাবেজে ডলারে সেভ হবে
          status: 'pending'
        }
      ])

      if (withdrawError) {
        alert('Error submitting withdrawal: ' + withdrawError.message)
        setLoading(false)
        return
      }

      // ৫. ইউজারের ব্যালেন্স থেকে কেটে নেওয়া
      const newBalance = profile.balance - withdrawAmountUSD
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id)

      if (updateError) {
        alert('Error updating balance: ' + updateError.message)
        setLoading(false)
        return
      }

      alert('Withdrawal request submitted successfully! Pending approval.')
      router.push('/dashboard')

    } catch (err) {
      alert('An unexpected error occurred: ' + err.message)
    } finally {
      setLoading(false)
    }
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
            <div className="grid grid-cols-3 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setMethod('bKash')}
                className={`py-2 text-xs font-bold rounded-xl border transition ${method === 'bKash' ? 'bg-pink-600/20 border-pink-500 text-pink-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
              >
                bKash
              </button>
              <button
                type="button"
                onClick={() => setMethod('Nagad')}
                className={`py-2 text-xs font-bold rounded-xl border transition ${method === 'Nagad' ? 'bg-orange-600/20 border-orange-500 text-orange-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
              >
                Nagad
              </button>
              <button
                type="button"
                onClick={() => setMethod('USDT')}
                className={`py-2 text-xs font-bold rounded-xl border transition ${method === 'USDT' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
              >
                USDT
              </button>
            </div>
          </div>

          {/* USDT সিলেক্ট করলে নেটওয়ার্ক সিলেক্ট করার অপশন দেখাবে */}
          {method === 'USDT' && (
            <div>
              <label className="text-xs font-semibold text-slate-300">Crypto Network</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setNetwork('TRC20')}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${network === 'TRC20' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                >
                  TRC20 (Tron)
                </button>
                <button
                  type="button"
                  onClick={() => setNetwork('BEP20')}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${network === 'BEP20' ? 'bg-yellow-600/20 border-yellow-500 text-yellow-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                >
                  BEP20 (BSC)
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300">
              {method === 'USDT' ? 'USDT Wallet Address' : `${method} Account Number`}
            </label>
            <input
              type="text"
              required
              placeholder={method === 'USDT' ? 'Enter wallet address (e.g. 0x...)' : '01700000000'}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">
                Amount ({method === 'USDT' ? 'USDT' : 'BDT'})
              </label>
              <span className="text-[10px] text-slate-400">
                {method === 'USDT' ? 'Limit: $5 - $100' : 'Limit: ৳200 - ৳2,500'}
              </span>
            </div>
            <input
              type="number"
              step={method === 'USDT' ? '0.01' : '1'}
              required
              placeholder={method === 'USDT' ? '10.00' : '500'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
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
              
