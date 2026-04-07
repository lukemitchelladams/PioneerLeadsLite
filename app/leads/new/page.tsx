'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { LeadSource, LeadType, LEAD_SOURCE_LABELS } from '@/lib/types'
import { ArrowLeft, CheckCircle } from 'lucide-react'

const LEAD_SOURCES: LeadSource[] = ['walk-in', 'phone-call', 'google-mb', 'angi', 'thumbtack', 'other']
const SOURCE_ICONS: Record<LeadSource, string> = {
  'walk-in': '🚶', 'phone-call': '📞', 'google-mb': '🔍',
  'angi': '🔧', 'thumbtack': '📌', 'other': '💬',
}

const card: React.CSSProperties = {
  backgroundColor: '#0F2035', border: '1px solid rgba(48,130,168,0.2)',
  borderRadius: '12px', padding: '20px', marginBottom: '14px',
}
const inp: React.CSSProperties = {
  width: '100%', padding: '8px 12px', backgroundColor: '#152840',
  border: '1px solid rgba(48,130,168,0.25)', borderRadius: '8px',
  fontSize: '13px', color: '#D4EAF7', outline: 'none',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: 600, color: '#3D6E8A',
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px',
}
const sectionTitle: React.CSSProperties = {
  fontSize: '12px', fontWeight: 600, color: '#6FA8C8',
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px',
}

export default function NewLeadPage() {
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const today = new Date().toISOString().split('T')[0]

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [leadDate, setLeadDate] = useState(today)
  const [type, setType] = useState<LeadType>('residential')
  const [leadSource, setLeadSource] = useState<LeadSource | ''>('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadSource) { setError('Please select a lead source.'); return }
    setLoading(true)
    setError('')

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        address,
        lead_date: leadDate || today,
        type,
        lead_source: leadSource,
        status: 'new',
      })
      .select()
      .single()

    if (leadError) {
      setError(leadError.message)
      setLoading(false)
      return
    }

    // FIX 1: Explicit null guard — should never happen but prevents crash
    if (!lead) {
      setError('Failed to create lead. Please try again.')
      setLoading(false)
      return
    }

    if (notes.trim()) {
      await supabase.from('lead_notes').insert({ lead_id: lead.id, content: notes.trim() })
    }

    router.push(`/leads/${lead.id}`)
  }

  const typeBtn = (t: LeadType, label: string, icon: string) => (
    <button type="button" onClick={() => setType(t)}
      style={{
        padding: '13px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
        cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        border: type === t ? '2px solid #3082A8' : '1px solid rgba(48,130,168,0.2)',
        backgroundColor: type === t ? 'rgba(48,130,168,0.15)' : 'transparent',
        color: type === t ? '#4AAECF' : '#6FA8C8',
      }}>
      <span style={{ fontSize: '16px' }}>{icon}</span> {label}
    </button>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B1929' }}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-7">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium mb-4 transition-colors"
            style={{ color: '#3D6E8A' }}>
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: '#D4EAF7' }}>Add New Lead</h1>
          <p className="text-sm mt-1" style={{ color: '#3D6E8A' }}>Enter the customer&apos;s information below</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Customer Info */}
          <div style={card}>
            <div style={sectionTitle}>Customer Information</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={lbl}>First Name *</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                  style={inp} placeholder="John" required />
              </div>
              <div>
                <label style={lbl}>Last Name *</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                  style={inp} placeholder="Smith" required />
              </div>
              <div>
                <label style={lbl}>Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  style={inp} placeholder="(555) 123-4567" />
              </div>
              <div>
                <label style={lbl}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  style={inp} placeholder="john@example.com" />
              </div>
              <div>
                <label style={lbl}>Date of Lead *</label>
                <input type="date" value={leadDate} onChange={e => setLeadDate(e.target.value)}
                  style={{ ...inp, colorScheme: 'dark' }} required />
              </div>
              <div className="sm:col-span-2">
                <label style={lbl}>Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                  style={inp} placeholder="123 Main St, City, State 12345" />
              </div>
            </div>
          </div>

          {/* Project Type */}
          <div style={card}>
            <div style={sectionTitle}>Project Type</div>
            <div className="grid grid-cols-2 gap-3">
              {typeBtn('residential', 'Residential', '🏠')}
              {typeBtn('commercial', 'Commercial', '🏢')}
            </div>
          </div>

          {/* Lead Source */}
          <div style={card}>
            <div style={sectionTitle}>Lead Source *</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LEAD_SOURCES.map(source => (
                <button key={source} type="button" onClick={() => setLeadSource(source)}
                  style={{
                    padding: '10px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                    cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
                    border: leadSource === source ? '2px solid #3082A8' : '1px solid rgba(48,130,168,0.2)',
                    backgroundColor: leadSource === source ? 'rgba(48,130,168,0.15)' : 'transparent',
                    color: leadSource === source ? '#4AAECF' : '#6FA8C8',
                  }}>
                  <span style={{ fontSize: '16px' }}>{SOURCE_ICONS[source]}</span>
                  {LEAD_SOURCE_LABELS[source]}
                </button>
              ))}
            </div>
            {!leadSource && <p className="text-xs mt-3" style={{ color: '#3D6E8A' }}>Select where this lead came from</p>}
          </div>

          {/* Initial Note */}
          <div style={card}>
            <div style={{ ...sectionTitle, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Initial Notes
              <span style={{ textTransform: 'none', letterSpacing: 0, fontSize: '11px', color: '#3D6E8A', fontWeight: 400 }}>(optional)</span>
            </div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              style={{ ...inp, minHeight: '90px', resize: 'none' }}
              placeholder="Project details, customer needs, follow-up actions..." />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg text-sm mb-4"
              style={{ backgroundColor: 'rgba(230,100,100,0.1)', border: '1px solid rgba(230,100,100,0.3)', color: '#E87070' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/dashboard" className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: 'transparent', border: '1px solid rgba(48,130,168,0.25)', color: '#6FA8C8' }}>
              Cancel
            </Link>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: loading ? '#1e5f7a' : '#3082A8', border: 'none' }}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                : <><CheckCircle className="w-4 h-4" /> Save Lead</>}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
