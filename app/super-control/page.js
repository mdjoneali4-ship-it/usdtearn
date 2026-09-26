'use client'
import { useState } from 'react'
import { ShieldCheck, Check, X, Clock, DollarSign, Users, AlertCircle } from 'lucide-react'

export default function SuperControl() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Admin Header */}
        <div className="bg-rose-950/30 border border-rose-900/50 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-rose-400 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6" /> Hidden Owner Control Panel
            </h1>
            <p className="text-xs text-slate-400 mt-1">Protected Admin Route: /super-control</p>
          </div>
          <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs rounded-full font-mono">
            OWNER MODE
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs text-slate-400">Pending Deposits</span>
            <div className="text-2xl font-bold mt-1 text-amber-400">3 Requests</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs text-slate-400">Pending VIP Upgrades</span>
            <div className="text-2xl font-bold mt-1 text-purple-400">1 Request</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs text-slate-400">Tasks Pending Approval</span>
            <div className="text-2xl font-bold mt-1 text-emerald-400">2 Tasks</div>
          </div>
        </div>

        {/* Pending Approval List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" /> Pending Deposit Approvals
          </h2>

          <div className="space-y-3">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">bKash</span>
                <p className="text-sm font-bold mt-1">User: #884920 (01700000000)</p>
                <p className="text-xs text-slate-400">TrxID: 9J82KLS72 | Amount: 500 BDT ($4.16 USDT)</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1 hover:bg-emerald-400 transition">
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button className="flex-1 md:flex-none px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-xs rounded-lg flex items-center justify-center gap-1 hover:bg-rose-500/20 transition">
                  <X className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
