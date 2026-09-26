'use client'
import { useEffect, useState } from 'react'
import { Shield, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminPanel() {
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDeposits() {
      const { data } = await supabase.from('deposits').select('*').order('created_at', { ascending: false })
      if (data) setDeposits(data)
      setLoading(false)
    }
    fetchDeposits()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <Shield className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl font-bold">Admin Management Panel</h1>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h2 className="font-semibold text-sm mb-4 text-slate-300">Deposit Requests</h2>
          {loading ? (
            <p className="text-xs text-slate-500">Loading requests...</p>
          ) : deposits.length === 0 ? (
            <p className="text-xs text-slate-500">No deposit requests found.</p>
          ) : (
            <div className="space-y-3">
              {deposits.map((item) => (
                <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-emerald-400">${item.amount} USDT ({item.method})</p>
                    <p className="text-slate-400">TrxID: {item.trx_id}</p>
                    <p className="text-slate-500 text-[10px]">Sender: {item.sender_address}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
