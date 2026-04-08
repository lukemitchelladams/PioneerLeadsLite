'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { Lead, LeadNote, LeadSource, LeadStatus, LeadType, LEAD_SOURCE_LABELS } from '@/lib/types'
import { ArrowLeft, Edit3, Save, X, Send, Trash2, Clock, CheckCircle } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

const LEAD_SOURCES: LeadSource[] = ['google-mb', 'google-maps', 'angi', 'thumbtack', 'facebook', 'instagram', 'linkedin', 'other']
const SOURCE_ICONS: Record<LeadSource, string> = {
  'google-mb': '🔍', 'google-maps': '🗺️', 'angi': '🔧',
  'thumbtack': '📌', 'facebook': '📘', 'instagram': '📸',
  'linkedin': '💼', 'other': '💬',
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; bg: string; text: string; border: string; activeBg: string }> = {
  new:                { label: 'New',              bg: 'rgba(74,174,207,0.13)',  text: '#4AAECF', border: 'rgba(74,174,207,0.3)',  activeBg: 'rgba(74,174,207,0.18)'  },
  contacted:          { label: 'Contacted',         bg: 'rgba(212,168,67,0.13)', text: '#D4A843', border: 'rgba(212,168,67,0.3)', activeBg: 'rgba(212,168,67,0.18)'  },
  'waiting-response': { label: 'Waiting Response',  bg: 'rgba(251,146,60,0.13)', text: '#FB923C', border: 'rgba(251,146,60,0.3)', activeBg: 'rgba(251,146,60,0.18)'  },
  quoted:             { label: 'Quoted',            bg: 'rgba(160,130,230,0.13)',text: '#C4AAED', border: 'rgba(160,130,230,0.3)',activeBg: 'rgba(160,130,230,0.18)' },
  'passed-to-sales':  { label: 'Passed Off to Sales', bg: 'rgba(48,130,168,0.13)', text: '#4AAECF', border: 'rgba(48,130,168,0.3)', activeBg: 'rgba(48,130,168,0.18)' },
  'passed-to-sales':  { label: 'Passed Off to Sales', bg: 'rgba(48,130,168,0.13)', text: '#4AAECF', border: 'rgba(48,130,168,0.3)', activeBg: 'rgba(48,130,168,0.18)' },
  won:                { label: 'Won',               bg: 'rgba(92,201,138,0.13)', text: '#5CC98A', border: 'rgba(92,201,138,0.3)', activeBg: 'rgba(92,201,138,0.18)'  },
  lost:               { label: 'Lost',              bg: 'rgba(230,100,100,0.13)',text: '#E87070', border: 'rgba(230,100,100,0.3)',activeBg: 'rgba(230,100,100,0.18)' },
}

const card: React.CSSProperties = { backgroundColor: '#0F2035', border: '1px solid rgba(48,130,168,0.2)', borderRadius: '12px', padding: '18px', marginBottom: '14px' }
const inp: React.CSSProperties = { width: '100%', padding: '7px 10px', backgroundColor: '#152840', border: '1px solid rgba(48,130,168,0.25)', borderRadius: '7px', fontSize: '13px', color: '#D4EAF7', outline: 'none' }
const lbl: React.CSSProperties = { display: 'block', fontSize: '10px', fontWeight: 600, color: '#3D6E8A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }

export default function LeadProfilePage() {
  const { id } = useParams()
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const [lead, setLead] = useState<Lead | null>(null)
  const [notes, setNotes] = useState<LeadNote[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [passedTo, setPassedTo] = useState('')
  const [savingPassedTo, setSavingPassedTo] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [editData, setEditData] = useState<Partial<Lead>>({})

  const fetchLead = useCallback(async () => {
    const { data } = await supabase.from('leads').select('*').eq('id', id).single()
    if (data) { setLead(data); setEditData(data); setPassedTo((data as any).passed_to || '') }
    setLoading(false)
  }, [id, supabase])

  const fetchNotes = useCallback(async () => {
    const { data } = await supabase.from('lead_notes').select('*').eq('lead_id', id).order('created_at', { ascending: false })
    if (data) setNotes(data)
  }, [id, supabase])

  useEffect(() => { fetchLead(); fetchNotes() }, [fetchLead, fetchNotes])

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    // Strip non-updatable system fields before sending to DB
    const { id: _id, created_at: _ca, ...updateFields } = editData as Lead
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updateFields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      setLead(data); setEditData(data); setEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } else if (error) {
      setSaveError('Failed to save changes. Please try again.')
    }
    setSaving(false)
  }

  const handleStatusChange = async (status: LeadStatus) => {
    const { data, error } = await supabase
      .from('leads').update({ status, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (!error && data) setLead(data)
    // If error, lead state unchanged — DB and UI stay consistent
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    setAddingNote(true)
    const { data, error } = await supabase
      .from('lead_notes').insert({ lead_id: id, content: newNote.trim() }).select().single()
    if (!error && data) { setNotes(prev => [data, ...prev]); setNewNote('') }
    setAddingNote(false)
  }

  const handleDeleteNote = async (noteId: string) => {
    const { error } = await supabase.from('lead_notes').delete().eq('id', noteId)
    if (!error) setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  const handleCancelEdit = () => { setEditData(lead || {}); setEditing(false) }

  const handleSavePassedTo = async () => {
    setSavingPassedTo(true)
    const { data } = await supabase
      .from('leads')
      .update({ passed_to: passedTo.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (data) setLead(data)
    setSavingPassedTo(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0B1929' }}>
        <Navbar />
        <div className="flex items-center justify-center py-32 flex-col gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#3082A8', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: '#3D6E8A' }}>Loading lead...</p>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0B1929' }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <p className="font-semibold" style={{ color: '#D4EAF7' }}>Lead not found</p>
          <Link href="/dashboard" className="mt-4 px-4 py-2 rounded-lg text-sm text-white font-medium" style={{ backgroundColor: '#3082A8' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const sc = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG['new']
  const leadDateDisplay = lead.lead_date
    ? format(new Date(lead.lead_date + 'T12:00:00'), 'MMMM d, yyyy')
    : format(new Date(lead.created_at), 'MMMM d, yyyy')

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B1929' }}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors" style={{ color: '#3D6E8A' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Profile header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0"
              style={{ backgroundColor: 'rgba(48,130,168,0.15)', border: '1px solid rgba(48,130,168,0.3)', color: '#4AAECF' }}>
              {lead.first_name[0]}{lead.last_name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#D4EAF7' }}>{lead.first_name} {lead.last_name}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                  {sc.label}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={lead.type === 'commercial'
                    ? { backgroundColor: 'rgba(100,120,200,0.15)', color: '#9BAEE8' }
                    : { backgroundColor: 'rgba(48,130,168,0.12)', color: '#4AAECF' }}>
                  {lead.type === 'commercial' ? '🏢 Commercial' : '🏠 Residential'}
                </span>
                <span className="text-xs flex items-center gap-1" style={{ color: '#3D6E8A' }}>
                  <Clock className="w-3 h-3" /> Lead Date: {leadDateDisplay}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {saveSuccess && (
              <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#5CC98A' }}>
                <CheckCircle className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            {saveError && (
              <span className="text-xs font-semibold" style={{ color: '#E87070' }}>
                {saveError}
              </span>
            )}
            {editing ? (
              <>
                <button onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: '#152840', border: '1px solid rgba(48,130,168,0.25)', color: '#6FA8C8' }}>
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: saving ? '#1e5f7a' : '#3082A8', border: 'none' }}>
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: '#152840', border: '1px solid rgba(48,130,168,0.25)', color: '#6FA8C8' }}>
                <Edit3 className="w-4 h-4" /> Edit Lead
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Details + Notes */}
          <div className="lg:col-span-2">
            {/* Customer Details */}
            <div style={card}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#3D6E8A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
                Customer Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label style={lbl}>First Name</label>
                  {editing
                    ? <input style={inp} value={editData.first_name || ''} onChange={e => setEditData({ ...editData, first_name: e.target.value })} />
                    : <p style={{ fontSize: '14px', color: '#D4EAF7', fontWeight: 500 }}>{lead.first_name}</p>}
                </div>
                {/* Last Name */}
                <div>
                  <label style={lbl}>Last Name</label>
                  {editing
                    ? <input style={inp} value={editData.last_name || ''} onChange={e => setEditData({ ...editData, last_name: e.target.value })} />
                    : <p style={{ fontSize: '14px', color: '#D4EAF7', fontWeight: 500 }}>{lead.last_name}</p>}
                </div>
                {/* Phone */}
                <div>
                  <label style={lbl}>Phone</label>
                  {editing
                    ? <input type="tel" style={inp} value={editData.phone || ''} placeholder="(555) 123-4567" onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                    : <p style={{ fontSize: '14px', color: lead.phone ? '#D4EAF7' : '#3D6E8A', fontStyle: lead.phone ? 'normal' : 'italic' }}>{lead.phone || 'Not provided'}</p>}
                </div>
                {/* Email */}
                <div>
                  <label style={lbl}>Email</label>
                  {editing
                    ? <input type="email" style={inp} value={editData.email || ''} placeholder="john@example.com" onChange={e => setEditData({ ...editData, email: e.target.value })} />
                    : <p style={{ fontSize: '14px', color: lead.email ? '#D4EAF7' : '#3D6E8A', fontStyle: lead.email ? 'normal' : 'italic' }}>{lead.email || 'Not provided'}</p>}
                </div>
                {/* Date of Lead */}
                <div>
                  <label style={lbl}>Date of Lead</label>
                  {editing
                    ? <input type="date" style={{ ...inp, colorScheme: 'dark' }} value={editData.lead_date || ''} onChange={e => setEditData({ ...editData, lead_date: e.target.value })} />
                    : <p style={{ fontSize: '14px', color: '#D4EAF7', fontWeight: 500 }}>{leadDateDisplay}</p>}
                </div>
                {/* Address */}
                <div className="sm:col-span-2">
                  <label style={lbl}>Address</label>
                  {editing
                    ? <input style={inp} value={editData.address || ''} placeholder="123 Main St, City, State" onChange={e => setEditData({ ...editData, address: e.target.value })} />
                    : <p style={{ fontSize: '14px', color: lead.address ? '#D4EAF7' : '#3D6E8A', fontStyle: lead.address ? 'normal' : 'italic' }}>{lead.address || 'Not provided'}</p>}
                </div>
                {/* Passed To */}
                <div className="sm:col-span-2">
                  <label style={lbl}>Passed Lead To</label>
                  {editing
                    ? <input style={inp} value={(editData as any).passed_to || ''} placeholder="Salesperson name..." onChange={e => setEditData({ ...editData, passed_to: e.target.value } as any)} />
                    : <p style={{ fontSize: '14px', color: (lead as any).passed_to ? '#D4EAF7' : '#3D6E8A', fontStyle: (lead as any).passed_to ? 'normal' : 'italic' }}>{(lead as any).passed_to || 'Not assigned'}</p>}
                </div>
              </div>

              {/* Edit: type + source selectors */}
              {editing && (
                <>
                  <div style={{ borderTop: '1px solid rgba(48,130,168,0.15)', margin: '16px 0 14px' }} />
                  <div style={{ ...lbl, marginBottom: '10px' }}>Project Type</div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {(['residential', 'commercial'] as LeadType[]).map(t => (
                      <button key={t} type="button" onClick={() => setEditData({ ...editData, type: t })}
                        style={{
                          padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                          border: editData.type === t ? '2px solid #3082A8' : '1px solid rgba(48,130,168,0.2)',
                          backgroundColor: editData.type === t ? 'rgba(48,130,168,0.15)' : 'transparent',
                          color: editData.type === t ? '#4AAECF' : '#6FA8C8',
                        }}>
                        {t === 'residential' ? '🏠 Residential' : '🏢 Commercial'}
                      </button>
                    ))}
                  </div>

                  <div style={{ ...lbl, marginBottom: '10px' }}>Lead Source</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {LEAD_SOURCES.map(source => (
                      <button key={source} type="button" onClick={() => setEditData({ ...editData, lead_source: source })}
                        style={{
                          padding: '8px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 500, cursor: 'pointer',
                          textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px',
                          border: editData.lead_source === source ? '2px solid #3082A8' : '1px solid rgba(48,130,168,0.2)',
                          backgroundColor: editData.lead_source === source ? 'rgba(48,130,168,0.15)' : 'transparent',
                          color: editData.lead_source === source ? '#4AAECF' : '#6FA8C8',
                        }}>
                        <span style={{ fontSize: '14px' }}>{SOURCE_ICONS[source]}</span>
                        {LEAD_SOURCE_LABELS[source]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notes */}
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '10px', fontWeight: 600, color: '#3D6E8A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
                Notes & Activity
                <span style={{ marginLeft: 'auto', textTransform: 'none', letterSpacing: 0, fontSize: '11px', fontWeight: 400, color: '#3D6E8A' }}>
                  {notes.length} note{notes.length !== 1 ? 's' : ''}
                </span>
              </div>

              <textarea value={newNote} onChange={e => setNewNote(e.target.value)}
                style={{ ...inp, minHeight: '72px', resize: 'none' }}
                placeholder="Add a note, follow-up, or update..."
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAddNote() }} />
              <div className="flex justify-between items-center mt-2">
                <span style={{ fontSize: '10px', color: '#3D6E8A' }}>⌘+Enter to post</span>
                <button onClick={handleAddNote} disabled={!newNote.trim() || addingNote}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: !newNote.trim() ? '#1e3a52' : '#3082A8', border: 'none', cursor: newNote.trim() ? 'pointer' : 'not-allowed' }}>
                  {addingNote ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Add Note
                </button>
              </div>

              {notes.length === 0 ? (
                <div className="text-center py-8" style={{ color: '#3D6E8A', fontSize: '13px' }}>
                  No notes yet. Add the first one above.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {notes.map(note => (
                    <div key={note.id} className="group flex gap-3 rounded-xl p-3"
                      style={{ backgroundColor: '#152840', border: '1px solid rgba(48,130,168,0.1)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                        style={{ backgroundColor: 'rgba(48,130,168,0.15)', color: '#4AAECF' }}>
                        PG
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#D4EAF7' }}>{note.content}</p>
                        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#3D6E8A' }}>
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                          &nbsp;·&nbsp;
                          {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 rounded"
                        style={{ color: '#3D6E8A', background: 'none', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#E87070')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#3D6E8A')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Status + Source + Timeline */}
          <div>
            {/* Status */}
            <div style={card}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#3D6E8A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
                Lead Status
              </div>
              <div className="space-y-1.5">
                {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map(s => {
                  const c = STATUS_CONFIG[s]
                  const active = lead.status === s
                  return (
                    <button key={s} onClick={() => handleStatusChange(s)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '8px 11px', borderRadius: '7px',
                        fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        border: active ? `1px solid ${c.border}` : '1px solid transparent',
                        backgroundColor: active ? c.activeBg : 'transparent',
                        color: active ? c.text : '#6FA8C8',
                      }}
                      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(48,130,168,0.08)' }}
                      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}>
                      {active && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', flexShrink: 0 }} />}
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Passed Lead To */}
            <div style={card}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#3D6E8A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
                Passed Lead To
              </div>
              <input
                type="text"
                value={passedTo}
                onChange={e => setPassedTo(e.target.value)}
                onBlur={handleSavePassedTo}
                placeholder="Enter salesperson name..."
                style={{ width: '100%', padding: '7px 10px', backgroundColor: '#152840', border: '1px solid rgba(48,130,168,0.25)', borderRadius: '7px', fontSize: '13px', color: '#D4EAF7', outline: 'none' }}
              />
              <p style={{ fontSize: '10px', color: '#3D6E8A', marginTop: '5px' }}>Auto-saves when you click away</p>
            </div>

            {/* Lead Source */}
            <div style={card}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#3D6E8A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
                Lead Source
              </div>
              <div className="flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500, color: '#D4EAF7' }}>
                <span style={{ fontSize: '20px' }}>{SOURCE_ICONS[lead.lead_source]}</span>
                {LEAD_SOURCE_LABELS[lead.lead_source]}
              </div>
            </div>

            {/* Timeline */}
            <div style={card}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#3D6E8A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                Timeline
              </div>
              <div className="space-y-3">
                <div>
                  <p style={{ fontSize: '10px', color: '#3D6E8A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' }}>Date of Lead</p>
                  <p style={{ fontSize: '13px', color: '#D4EAF7', fontWeight: 500 }}>{leadDateDisplay}</p>
                </div>
                <div style={{ borderTop: '1px solid rgba(48,130,168,0.12)', paddingTop: '10px' }}>
                  <p style={{ fontSize: '10px', color: '#3D6E8A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' }}>Record Created</p>
                  <p style={{ fontSize: '13px', color: '#D4EAF7', fontWeight: 500 }}>{format(new Date(lead.created_at), 'MMM d, yyyy')}</p>
                  <p style={{ fontSize: '11px', color: '#3D6E8A' }}>{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
