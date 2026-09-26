'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Copy, Users, DollarSign, Check, Share2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ReferralPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [referredUsers, setReferredUsers] = useState([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }

    async function fetchReferralData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch Profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userProfile) {
        setProfile(userProfile)

        // Fetch Referred Users
        if (userProfile.referral_code) {
          const { data: team } = await supabase
            .from('profiles')
            .select('id, full_name, created_at, vip_level')
            .eq('referred_by', userProfile.referral_code)

          if (team) setReferredUsers(team)
        }
      }
      setLoading(false)
    }

    fetchReferralData()
  }, [router])

  const referralLink = origin && profile?.referral_code
    ? `${origin}/signup?ref=${profile.referral_code}`
    : profile?.referral_code ? `https://usdtearn.ai/signup?ref=${profile.referral_code}` : 'Generating code...'

  const handleCopy = () => {
    if (!referralLink || referralLink === 'Generating code...') return
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-emerald-400 font-semibold animate-pulse">Loading Referral Hub...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <Link href="/dashboard" className="p-2 bg-slate-800 rounded-xl text-slate-300">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-400" /> Invite & Earn
            </h1>
            <p className="text-xs text-slate-400">Invite friends and earn commission on their VIP upgrades</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
              <Users className="w-4 h-4 text-teal-400" /> Total Referred
            </div>
            <h2 className="text-2xl font-extrabold text-white">{referredUsers.length} <span className="text-xs text-slate-400 font-normal">Users</span></h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Your Code
            </div>
            <h2 className="text-2xl font-extrabold text-amber-400">{profile?.referral_code || 'N/A'}</h2>
          </div>
        </div>

        {/* Referral Link Box */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <label className="text-xs font-bold uppercase text-slate-400">Your Invitation Link</label>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={referralLink} 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
            />
            <button 
              onClick={handleCopy}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Team Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            My Team ({referredUsers.length})
          </h2>

          {referredUsers.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-500 text-xs">
              No users invited yet. Share your link to start earning!
            </div>
          ) : (
            <div className="space-y-2">
              {referredUsers.map((user) => (
                <div key={user.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-bold text-xs text-slate-200">{user.full_name || 'Anonymous User'}</p>
                    <p className="text-[10px] text-slate-500">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    VIP {user.vip_level || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
                      }
