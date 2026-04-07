'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LogOut, LayoutDashboard, PlusCircle } from 'lucide-react'

function MountainLogo() {
  return (
    <svg viewBox="0 0 90 52" width="50" height="30" xmlns="http://www.w3.org/2000/svg">
      <polygon points="5,52 22,14 38,52" fill="#D4EAF7" opacity="0.55" />
      <polygon points="28,52 45,4 62,52" fill="#D4EAF7" opacity="0.95" />
      <polygon points="52,52 68,16 85,52" fill="#D4EAF7" opacity="0.65" />
    </svg>
  )
}

export default function Navbar() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: '#07111E', borderColor: 'rgba(48,130,168,0.2)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/dashboard" className="flex items-center gap-3">
            <MountainLogo />
            <div className="flex flex-col leading-none">
              <span className="font-semibold text-sm" style={{ color: '#D4EAF7', letterSpacing: '0.12em' }}>
                PIONEER
              </span>
              <span className="text-[9px] mt-0.5" style={{ color: '#3082A8', letterSpacing: '0.18em' }}>
                GRANITE &amp; QUARTZ
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
              style={{ color: '#6FA8C8' }}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              href="/leads/new"
              className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold"
              style={{ backgroundColor: '#3082A8' }}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Lead</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
              style={{ color: '#6FA8C8' }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
