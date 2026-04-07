'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle } from 'lucide-react'

function MountainLogo() {
  return (
    <svg viewBox="0 0 120 70" width="100" height="58" xmlns="http://www.w3.org/2000/svg">
      <polygon points="5,70 30,18 54,70" fill="#D4EAF7" opacity="0.5" />
      <polygon points="38,70 62,4 86,70" fill="#D4EAF7" opacity="0.95" />
      <polygon points="68,70 92,22 116,70" fill="#D4EAF7" opacity="0.6" />
    </svg>
  )
}

type Step = 'verify' | 'register' | 'success'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('verify')
  const [answer, setAnswer] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showCpw, setShowCpw] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)

  // Step 1: Only check the answer — does NOT create any user
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifyLoading(true)
    setVerifyError('')

    const res = await fetch('/api/verify-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    })

    const data = await res.json()

    if (res.ok && data.verified) {
      setStep('register')
    } else {
      setVerifyError(data.error || 'Incorrect answer. Please try again.')
    }

    setVerifyLoading(false)
  }

  // Step 2: Create the real account now that answer is confirmed
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError('')

    if (password !== confirmPassword) {
      setRegisterError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setRegisterError('Password must be at least 8 characters.')
      return
    }

    setRegisterLoading(true)

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, answer }),
    })

    const data = await res.json()

    if (!res.ok) {
      setRegisterError(data.error || 'Something went wrong. Please try again.')
      setRegisterLoading(false)
      return
    }

    // Auto sign-in immediately after account creation
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })

    if (!loginError) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setStep('success')
    }

    setRegisterLoading(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px',
    backgroundColor: '#152840', border: '1px solid rgba(48,130,168,0.3)',
    borderRadius: '8px', fontSize: '14px', color: '#D4EAF7', outline: 'none',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 600, color: '#3D6E8A',
    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px',
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#07111E' }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="flex justify-center mb-2"><MountainLogo /></div>
          <h1 className="text-2xl font-bold tracking-widest" style={{ color: '#D4EAF7', letterSpacing: '0.15em' }}>PIONEER</h1>
          <p className="text-xs tracking-widest mt-1" style={{ color: '#3082A8', letterSpacing: '0.2em' }}>GRANITE &amp; QUARTZ</p>
          <div className="w-14 mx-auto mt-3 mb-1" style={{ borderTop: '1px solid rgba(48,130,168,0.4)' }} />
          <p className="text-xs" style={{ color: '#3D6E8A' }}>Create Staff Account</p>
        </div>

        {/* STEP 1 — Secret Question */}
        {step === 'verify' && (
          <div className="rounded-2xl p-8" style={{ backgroundColor: '#0F2035', border: '1px solid rgba(48,130,168,0.25)' }}>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5" style={{ color: '#3082A8' }} />
              <h2 className="text-base font-semibold" style={{ color: '#D4EAF7' }}>Staff Verification</h2>
            </div>
            <p className="text-sm mb-6" style={{ color: '#6FA8C8' }}>
              Answer the security question below. Contact your manager if you don&apos;t know the answer.
            </p>

            <form onSubmit={handleVerify} className="space-y-5">
              <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(48,130,168,0.08)', border: '1px solid rgba(48,130,168,0.2)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#3D6E8A' }}>Security Question</p>
                <p className="text-sm font-medium" style={{ color: '#D4EAF7' }}>
                  What is the middle name of the person that created this app?
                </p>
              </div>

              <div>
                <label style={lbl}>Your Answer</label>
                <input type="text" value={answer} onChange={e => setAnswer(e.target.value)}
                  style={inp} placeholder="Enter your answer..." required autoComplete="off" />
              </div>

              {verifyError && (
                <div className="px-4 py-3 rounded-lg text-sm"
                  style={{ backgroundColor: 'rgba(230,100,100,0.1)', border: '1px solid rgba(230,100,100,0.3)', color: '#E87070' }}>
                  {verifyError}
                </div>
              )}

              <button type="submit" disabled={verifyLoading}
                className="w-full text-white font-semibold py-2.5 rounded-lg text-sm"
                style={{ backgroundColor: verifyLoading ? '#1e5f7a' : '#3082A8' }}>
                {verifyLoading ? 'Verifying...' : 'Verify & Continue →'}
              </button>
            </form>

            <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(48,130,168,0.15)' }}>
              <Link href="/login" className="flex items-center justify-center gap-2 text-sm" style={{ color: '#3D6E8A' }}>
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2 — Register */}
        {step === 'register' && (
          <div className="rounded-2xl p-8" style={{ backgroundColor: '#0F2035', border: '1px solid rgba(48,130,168,0.25)' }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#5CC98A' }} />
              <p className="text-xs font-semibold" style={{ color: '#5CC98A' }}>Verification passed</p>
            </div>
            <h2 className="text-base font-semibold mb-1 mt-3" style={{ color: '#D4EAF7' }}>Create Your Account</h2>
            <p className="text-sm mb-6" style={{ color: '#6FA8C8' }}>Set up your login credentials for the Pioneer dashboard.</p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label style={lbl}>Work Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  style={inp} placeholder="you@pioneergranite.com" required autoComplete="email" />
              </div>
              <div>
                <label style={lbl}>Password (min. 8 characters)</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    style={{ ...inp, paddingRight: '40px' }} placeholder="Create a password" required />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#3D6E8A' }}>
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label style={lbl}>Confirm Password</label>
                <div className="relative">
                  <input type={showCpw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    style={{ ...inp, paddingRight: '40px' }} placeholder="Re-enter password" required />
                  <button type="button" onClick={() => setShowCpw(!showCpw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#3D6E8A' }}>
                    {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {registerError && (
                <div className="px-4 py-3 rounded-lg text-sm"
                  style={{ backgroundColor: 'rgba(230,100,100,0.1)', border: '1px solid rgba(230,100,100,0.3)', color: '#E87070' }}>
                  {registerError}
                </div>
              )}

              <button type="submit" disabled={registerLoading}
                className="w-full text-white font-semibold py-2.5 rounded-lg text-sm"
                style={{ backgroundColor: registerLoading ? '#1e5f7a' : '#3082A8' }}>
                {registerLoading ? 'Creating Account...' : 'Create Account & Sign In'}
              </button>
            </form>

            <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(48,130,168,0.15)' }}>
              <Link href="/login" className="flex items-center justify-center gap-2 text-sm" style={{ color: '#3D6E8A' }}>
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* STEP 3 — Success fallback */}
        {step === 'success' && (
          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#0F2035', border: '1px solid rgba(92,201,138,0.3)' }}>
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(92,201,138,0.15)' }}>
              <CheckCircle className="w-7 h-7" style={{ color: '#5CC98A' }} />
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#D4EAF7' }}>Account Created!</h2>
            <p className="text-sm mb-6" style={{ color: '#6FA8C8' }}>Your account has been set up. Sign in with your credentials.</p>
            <Link href="/login" className="block w-full text-white font-semibold py-2.5 rounded-lg text-sm text-center"
              style={{ backgroundColor: '#3082A8' }}>
              Go to Sign In
            </Link>
          </div>
        )}

        <p className="text-center text-xs mt-6" style={{ color: '#3D6E8A' }}>
          © {new Date().getFullYear()} Pioneer Granite and Quartz
        </p>
      </div>
    </div>
  )
}
