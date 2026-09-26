import Link from 'next/link'
import { ArrowRight, Zap, Wallet, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-black">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            USDTEarn.ai
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white transition">
              Login
            </Link>
            <Link href="/signup" className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 text-center max-w-4xl mx-auto">
        <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
          #1 Micro-Task Marketplace in BD
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold mt-6 tracking-tight leading-tight">
          Complete Tasks. Earn <span className="text-emerald-400">USDT</span>. Cashout via bKash & Nagad.
        </h1>
        <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
          Post tasks for your business or complete micro-tasks to earn daily revenue. Instant conversion and local payout methods guaranteed.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/signup" className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition">
            Start Earning Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <section className="py-16 border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Wallet className="w-10 h-10 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Local Gateways</h3>
            <p className="text-slate-400 text-sm">Deposit and withdraw directly with bKash, Nagad, or TRC20/BEP20 USDT.</p>
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Zap className="w-10 h-10 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">VIP Tiers</h3>
            <p className="text-slate-400 text-sm">Upgrade to VIP 1 (250 BDT) or VIP 2 (500 BDT) for exclusive high-paying tasks.</p>
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Users className="w-10 h-10 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Affiliate Program</h3>
            <p className="text-slate-400 text-sm">Invite friends and earn multi-tier commissions from their task earnings.</p>
          </div>
        </div>
      </section>
    </div>
  )
    }
