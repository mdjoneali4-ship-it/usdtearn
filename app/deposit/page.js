'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Wallet, Copy, CheckCircle, Info, DollarSign } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function DepositPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState('bkash') // 'bkash', 'nagad', 'usdt'
  const [network, setNetwork] = useState('TRC20') // 'TRC20', 'BEP20', 'ERC20', 'Polygon', 'TON'
  const [amount, setAmount] = useState('')
  const [trxId, setTrxId] = useState('')
  const [copied, setCopied] = useState(false)

  // Rate: 1 USDT = 120 BDT
  const USDT_RATE = 120

  // BDT Personal Number
  const bdtPersonalNumber = '01402569421'

  // BDT Payment Numbers
  const bdtPaymentNumbers = {
    bkash: bdtPersonalNumber,
    nagad: bdtPersonalNumber
  }

  // Exact USDT Wallet Addresses from Screenshots
  const usdtWallets = {
    TRC20: 'TJKsRbpn9FfTb76fv9hnqbSb3QJMDztT9',
    BEP20: '0x3db881a549aa0f18e4ocdaaec119584e3af3669a',
    ERC20: '0x3db881a549aa0f18e4ocdaaec119584e3af3669a',
    Polygon: '0x3db881a549aa0f18e4ocdaaec119584e3af3669a',
    TON: 'UQAwgoHXIUh_j3wKiOhbQnRaOaYcw6LgidxrHcXGMHFoDPdt'
  }

  // Get current payment address/number
  const currentAddress = method === 'usdt' 
    ? usdtWallets[network] 
    : bdtPaymentNumbers[method]

  // Calculate USDT when BDT is entered
  const calculatedUsdt = method !== 'usdt' && amount 
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
      return alert('Sothik poriman ullekh korun!')
    }

    // Minimum Deposit Validations
    if (method !== 'usdt' && numericAmount < 100) {
      return alert('bKash/Nagad-e minimum deposit 100 Taka!')
    }

    if (method === 'usdt' && numericAmount < 1) {
      return alert('USDT-e minimum deposit $1 USDT!')
    }

    if (!trxId) return alert('Transaction ID / TxID prodan korun')

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Anugroh kore age login korun')
        return router.push('/login')
      }

      const selectedMethodName = method === 'usdt' ? `USDT (${network})` : method.toUpperCase()

      // Insert Deposit Record
      const { error } = await supabase.from('deposits').insert([
        {
          user_id: user.id,
          amount: numericAmount,
          method: selectedMethodName,
          trx_id: trxId,
          status: 'pending'
        }
      ])

      if (error) throw error

      alert('Deposit request shofolbhabe joma hoyeche! Admin jachai kore balance jog kore debe.')
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
      {method !== 'usdt' ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl flex items-center gap-3 text-xs text-emerald-400">
          <Info className="w-5 h-5 shrink-0" />
          <div>
            <p><span className="font-bold">Minimum Deposit:</span> 100 BDT</p>
            <p><span className="font-bold">Rate:</span> $1.00 USDT = {USDT_RATE} BDT। Taka pathale automatic dollar-e convert hoye balance jog hobe.</p>
          </div>
        </div>
      ) : (
        <div className="bg-blue-500/10 border border-blue-500/30 p-3.5 rounded-xl flex items-center gap-3 text-xs text-blue-400">
          <DollarSign className="w-5 h-5 shrink-0" />
          <div>
            <p><span className="font-bold">Minimum Deposit:</span> $1.00 USDT</p>
            <p>Sothik network select kore address-e USDT pathan.</p>
          </div>
        </div>
      )}

      {/* Select Payment Method */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-2">Payment Method Select Korun:</label>
          <div className="grid grid-cols-3 gap-2">
            {['bkash', 'nagad', 'usdt'].map((m) => (
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
        </div>

        {/* USDT Network Selector Options */}
        {method === 'usdt' && (
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">Select Network:</label>
            <div className="grid grid-cols-3 gap-2">
              {['TRC20', 'BEP20', 'ERC20', 'Polygon', 'TON'].map((net) => (
                <button
                  key={net}
                  type="button"
                  onClick={() => setNetwork(net)}
                  className={`py-2 px-1 rounded-lg text-[11px] font-bold transition-all border ${
                    network === net
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Address / Number Display */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400 uppercase">
            {method === 'usdt' ? `USDT (${network}) Address` : `${method} Personal Number`}:
          </p>
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <p className="font-mono font-bold text-emerald-400 text-xs break-all">{currentAddress}</p>
            <button
              type="button"
              onClick={() => copyToClipboard(currentAddress)}
              className="flex items-center gap-1 text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300 shrink-0 self-start"
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
            {method !== 'usdt' ? 'Takad poriman (BDT) [Min: 100 Tk]:' : 'Poriman (USDT) [Min: $1]:'}
          </label>
          <input
            type="number"
            step="any"
            placeholder={method !== 'usdt' ? 'e.g. 500' : 'e.g. 10'}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full bg-slate-950 p-3 rounded-lg border border-slate-800 text-white font-mono focus:border-emerald-500 outline-none"
          />
        </div>

        {/* Conversion Calculation Display */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex justify-between items-center">
          <span className="text-slate-400">Account-e balance jog hobe:</span>
          <span className="font-bold text-emerald-400 text-sm font-mono">${calculatedUsdt} USDT</span>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-semibold">
            {method !== 'usdt' ? 'TrxID (bKash/Nagad Transaction ID):' : 'TxID / Hash (Crypto Transaction Hash):'}
          </label>
          <input
            type="text"
            placeholder={method !== 'usdt' ? 'e.g. 9J87X6Y5Z' : 'e.g. 0x123...abc'}
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
          {loading ? 'Joma hocche...' : 'Submit Deposit'}
        </button>
      </form>
    </div>
  )
                }
