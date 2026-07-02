import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { ShieldCheck, ShieldAlert, Key, Loader2, Send, Check, Copy, LogOut } from 'lucide-react'

export function ApiPage() {
  const [verified, setVerified] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    const isVerified = sessionStorage.getItem('api_portal_verified') === 'true'
    if (isVerified) {
      setVerified(true)
    }
  }, [])

  const handleSendOtp = async () => {
    if (!supabase) return
    setLoading(true)
    setErrorMsg('')
    try {
      const { data, error } = await supabase!.functions.invoke('send-api-otp')
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      setOtpSent(true)
      alert('📩 6-Digit Verification Code sent to thekeepsakemoment@gmail.com')
    } catch (err: any) {
      console.error('OTP Send error:', err)
      setErrorMsg(err.message || 'Failed to send verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || !supabase) return
    setLoading(true)
    setErrorMsg('')
    try {
      const now = new Date().toISOString()
      
      // Query OTP in db
      const { data: otpRecord, error: queryErr } = await supabase!
        .from('api_otps')
        .select('id')
        .eq('code', code.trim())
        .eq('used', false)
        .gt('expires_at', now)
        .limit(1)
        .maybeSingle()

      if (queryErr) throw queryErr

      if (!otpRecord) {
        throw new Error('Invalid or expired verification code.')
      }

      // Mark OTP as used
      const { error: updateErr } = await supabase!
        .from('api_otps')
        .update({ used: true })
        .eq('id', otpRecord.id)

      if (updateErr) throw updateErr

      // Auth successful
      sessionStorage.setItem('api_portal_verified', 'true')
      setVerified(true)
    } catch (err: any) {
      console.error('OTP Verification error:', err)
      setErrorMsg(err.message || 'Incorrect verification code.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(label)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleLock = () => {
    sessionStorage.removeItem('api_portal_verified')
    setVerified(false)
    setOtpSent(false)
    setCode('')
  }

  // Verification Screen
  if (!verified) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-parchment/20 p-6">
        <div className="w-full max-w-md bg-white border border-burgundy-100 rounded-3xl p-8 shadow-soft flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-full bg-burgundy-50 border border-burgundy-150 flex items-center justify-center text-burgundy-800 mb-4 animate-pulse">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-2xl text-burgundy-950 font-semibold mb-2">API Security Verification</h1>
          <p className="text-xs text-gray-500 max-w-[280px] leading-relaxed mb-6">
            Access to site credentials and configuration keys is protected. Verify your login with a code sent to <strong>thekeepsakemoment@gmail.com</strong>.
          </p>

          {errorMsg && (
            <div className="w-full mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-semibold leading-relaxed">
              {errorMsg}
            </div>
          )}

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3 bg-burgundy-800 text-white rounded-xl text-xs font-semibold hover:bg-burgundy-700 transition flex items-center justify-center gap-1.5 shadow-glow"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Code…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Verification Code
                </>
              )}
            </button>
          ) : (
            <form onSubmit={handleVerifyOtp} className="w-full space-y-4">
              <input
                type="text"
                maxLength={6}
                required
                placeholder="Enter 6-Digit Code"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-xl border border-gray-250 py-3 text-center text-lg font-mono font-bold tracking-[0.3em] text-burgundy-950 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-50"
              />
              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full py-3 bg-burgundy-850 text-white rounded-xl text-xs font-semibold hover:bg-burgundy-750 transition flex items-center justify-center gap-1.5 shadow-glow"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Verify Code & Unlock
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="text-xs text-burgundy-500 font-semibold hover:underline block mx-auto"
              >
                Resend Code
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  // API Credentials Listing Screen
  const API_KEYS = [
    {
      label: 'Razorpay Live Key ID',
      val: 'rzp_live_T8XCxe7tplUewm',
      desc: 'Used by Checkout component to initiate live customer payments.'
    },
    {
      label: 'Razorpay Key Secret',
      val: 'n2rST1X56oP77n3yBfaxKdJE',
      desc: 'Used securely by Edge Function verify-razorpay-payment to authenticate incoming checkout signatures.'
    },
    {
      label: 'Supabase Project URL',
      val: 'https://rjrwpulvystjkcfeldpk.supabase.co',
      desc: 'Main project reference URL connecting client to database endpoints.'
    },
    {
      label: 'Supabase Public Anon Key',
      val: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndwdWx2eXN0amtjZmVsZHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDk2MjIsImV4cCI6MjA5MzI4NTYyMn0.DifCVn_QgyabDvken0f7J2aKsonRrzrHcTdqBxuWNSo',
      desc: 'Public client key matching PostgREST schema definitions.'
    },
    {
      label: 'Resend API Key (Full Access)',
      val: 're_AaECeZHb_AmKFJPcSMWDFsTZj1UfHQyqS',
      desc: 'Full-permission API token used to query support inboxes and deliver support mails.'
    },
    {
      label: 'Resend Webhook Signing Secret',
      val: 'whsec_5oY42Fd7tLog1odA+Bfq8KchXFjnMAtw',
      desc: 'Shared cryptographic secret key validating Resend inbound email events.'
    },
    {
      label: 'Support Inbound Webhook Endpoint URL',
      val: 'https://rjrwpulvystjkcfeldpk.supabase.co/functions/v1/receive-support-email',
      desc: 'Configure this URL in your Resend Dashboard Webhooks page for the email.received event.'
    }
  ]

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-burgundy-950 flex items-center gap-2">
            <Key className="h-7 w-7 text-burgundy-800" />
            Secure API Configurations
          </h1>
          <p className="text-xs text-burgundy-400 mt-1">Configure and manage developer keys used across the platform.</p>
        </div>
        <button
          onClick={handleLock}
          className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold text-red-800 transition hover:bg-red-100"
        >
          <LogOut className="h-3.5 w-3.5" />
          Lock Portal
        </button>
      </div>

      {/* Keys List */}
      <div className="grid gap-6 md:grid-cols-2">
        {API_KEYS.map(key => (
          <div key={key.label} className="rounded-2xl border border-gray-150 bg-white p-5 shadow-soft flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wide">{key.label}</h3>
                <button
                  onClick={() => handleCopy(key.val, key.label)}
                  className={`p-1.5 rounded-lg border transition ${
                    copiedKey === key.label
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {copiedKey === key.label ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 font-medium leading-relaxed mt-1.5">{key.desc}</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 select-all overflow-x-auto scrollbar-thin">
              <span className="font-mono text-xs text-gray-700 whitespace-pre">{key.val}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
