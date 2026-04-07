'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

function MountainLogo() {
  return (
    <svg viewBox="0 0 120 70" width="120" height="70" xmlns="http://www.w3.org/2000/svg">
      <polygon points="5,70 30,18 54,70" fill="#D4EAF7" opacity="0.5" />
      <polygon points="38,70 62,4 86,70" fill="#D4EAF7" opacity="0.95" />
      <polygon points="68,70 92,22 116,70" fill="#D4EAF7" opacity="0.6" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    backgroundColor: '#152840',
    border: '1px solid rgba(48,130,168,0.3)',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#D4EAF7',
    outline: 'none',
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#07111E' }}>
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <MountainLogo />
          </div>
          <h1 className="text-3xl font-bold tracking-widest" style={{ color: '#D4EAF7', letterSpacing: '0.15em' }}>
            PIONEER
          </h1>
          <p className="text-xs tracking-widest mt-1 font-medium" style={{ color: '#3082A8', letterSpacing: '0.2em' }}>
            GRANITE &amp; QUARTZ
          </p>
          <div className="w-16 mx-auto mt-3 mb-1" style={{ borderTop: '1px solid rgba(48,130,168,0.4)' }} />
          <p className="text-xs" style={{ color: '#3D6E8A' }}>Leads Management System</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ backgroundColor: '#0F2035', border: '1px solid rgba(48,130,168,0.25)' }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: '#D4EAF7' }}>Welcome back</h2>
          <p className="text-sm mb-6" style={{ color: '#3D6E8A' }}>Sign in to access your leads dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#3D6E8A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>
                Email Address
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                style={inputStyle} placeholder="you@pioneergranite.com" required autoComplete="email" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#3D6E8A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>
                Password
              </label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '40px' }} placeholder="••••••••" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#3D6E8A' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg text-sm"
                style={{ backgroundColor: 'rgba(230,100,100,0.1)', border: '1px solid rgba(230,100,100,0.3)', color: '#E87070' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
              style={{ backgroundColor: loading ? '#1e5f7a' : '#3082A8' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1" style={{ borderTop: '1px solid rgba(48,130,168,0.15)' }} />
            <span className="text-xs" style={{ color: '#3D6E8A' }}>or</span>
            <div className="flex-1" style={{ borderTop: '1px solid rgba(48,130,168,0.15)' }} />
          </div>

          <Link href="/signup"
            className="block w-full text-center font-semibold py-2.5 rounded-lg transition-colors text-sm"
            style={{ backgroundColor: 'rgba(48,130,168,0.1)', border: '1px solid rgba(48,130,168,0.25)', color: '#4AAECF' }}>
            Create Staff Account
          </Link>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#3D6E8A' }}>
          © {new Date().getFullYear()} Pioneer Granite and Quartz. All rights reserved.
        </p>
      </div>
    </div>
  )
}
