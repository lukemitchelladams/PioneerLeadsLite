'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { Lead, LeadSource, LeadStatus, LeadType, LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from '@/lib/types'
import { Users, TrendingUp, Star, Trophy, Search, Plus, ChevronRight, Phone, MapPin, Calendar, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

const SOURCE_COLORS: Record<LeadSource, string> = {
  'walk-in': 'rgba(160,130,230,0.15)',
  'phone-call': 'rgba(48,130,168,0.15)',
  'google-mb': 'rgba(92,201,138,0.15)',
  'angi': 'rgba(230,150,80,0.15)',
  'thumbtack': 'rgba(74,174,207,0.15)',
  'other': 'rgba(100,100,120,0.2)',
}
const SOURCE_TEXT: Record<LeadSource, string> = {
  'walk-in': '#C4AAED',
  'phone-call': '#4AAECF',
  'google-mb': '#5CC98A',
  'angi': '#E89C50',
  'thumbtack': '#4AAECF',
  'other': '#6FA8C8',
}
const STATUS_COLORS: Record<LeadStatus, { bg: string; text: string; border: string }> = {
  new: { bg: 'rgba(74,174,207,0.13)', text: '#4AAECF', border: 'rgba(74,174,207,0.3)' },
  contacted: { bg: 'rgba(212,168,67,0.13)', text: '#D4A843', border: 'rgba(212,168,67,0.3)' },
  'waiting-response': { bg: 'rgba(251,146,60,0.13)', text: '#FB923C', border: 'rgba(251,146,60,0.3)' },
  quoted: { bg: 'rgba(160,130,230,0.13)', text: '#C4AAED', border: 'rgba(160,130,230,0.3)' },
  won: { bg: 'rgba(92,201,138,0.13)', text: '#5CC98A', border: 'rgba(92,201,138,0.3)' },
  lost: { bg: 'rgba(230,100,100,0.13)', text: '#E87070', border: 'rgba(230,100,100,0.3)' },
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const c = STATUS_COLORS[status]
  return (
    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {LEAD_STATUS_LABELS[status]}
    </span>
  )
}
function SourceBadge({ source }: { source: LeadSource }) {
  return (
    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: SOURCE_COLORS[source], color: SOURCE_TEXT[source] }}>
      {LEAD_SOURCE_LABELS[source]}
    </span>
  )
}

export default function DashboardPage() {
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current
  const [leads, setLeads] = useState<Lead[]>([])
  const [filtered, setFiltered] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<LeadType | 'all'>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    const { data } = await supabase.from('leads').select('*').order('lead_date', { ascending: false, nullsFirst: false })
    if (data) setLeads(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  useEffect(() => {
    let result = leads
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        `${l.first_name} ${l.last_name} ${l.phone} ${l.address}`.toLowerCase().includes(q)
      )
    }
    if (sourceFilter !== 'all') result = result.filter(l => l.lead_source === sourceFilter)
    if (statusFilter !== 'all') result = result.filter(l => l.status === statusFilter)
    if (typeFilter !== 'all') result = result.filter(l => l.type === typeFilter)
    setFiltered(result)
  }, [leads, search, sourceFilter, statusFilter, typeFilter])

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (!error) {
      setLeads(prev => prev.filter(l => l.id !== id))
    } else {
      alert('Failed to delete lead. Please try again.')
    }
    setDeleteId(null)
  }

  const today = new Date().toDateString()
  const newToday = leads.filter(l => new Date(l.created_at).toDateString() === today).length
  const wonLeads = leads.filter(l => l.status === 'won').length
  const activeLeads = leads.filter(l => l.status !== 'lost' && l.status !== 'won').length

  const inputStyle = { backgroundColor: '#152840', border: '1px solid rgba(48,130,168,0.2)', color: '#D4EAF7' }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B1929' }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#D4EAF7' }}>Leads Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: '#3D6E8A' }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <Link href="/leads/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Lead
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Leads', val: leads.length, color: '#D4EAF7', icon: <Users className="w-5 h-5" /> },
            { label: 'New Today', val: newToday, color: '#4AAECF', icon: <TrendingUp className="w-5 h-5" /> },
            { label: 'Active', val: activeLeads, color: '#4AAECF', icon: <Star className="w-5 h-5" /> },
            { label: 'Won', val: wonLeads, color: '#5CC98A', icon: <Trophy className="w-5 h-5" /> },
          ].map(s => (
            <div key={s.label} className="card p-5" style={{ backgroundColor: '#0F2035' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#3D6E8A' }}>{s.label}</p>
                  <p className="text-3xl font-bold" style={{ color: s.color }}>{s.val}</p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(48,130,168,0.1)', color: '#3082A8' }}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6" style={{ backgroundColor: '#0F2035' }}>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#3D6E8A' }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, phone, address..."
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none"
                style={inputStyle} />
            </div>
            {[
              { id: 'src', val: sourceFilter, set: setSourceFilter, opts: Object.entries(LEAD_SOURCE_LABELS), placeholder: 'All Sources' },
              { id: 'st', val: statusFilter, set: setStatusFilter, opts: Object.entries(LEAD_STATUS_LABELS), placeholder: 'All Statuses' },
            ].map(f => (
              <select key={f.id} value={f.val} onChange={e => f.set(e.target.value as any)}
                className="rounded-lg text-sm px-3 py-2 focus:outline-none" style={inputStyle}>
                <option value="all">{f.placeholder}</option>
                {f.opts.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            ))}
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as LeadType | 'all')}
              className="rounded-lg text-sm px-3 py-2 focus:outline-none" style={inputStyle}>
              <option value="all">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          <p className="text-xs mt-2" style={{ color: '#3D6E8A' }}>Showing {filtered.length} of {leads.length} leads</p>
        </div>

        {/* Table */}
        <div className="card overflow-hidden" style={{ backgroundColor: '#0F2035' }}>
          {loading ? (
            <div className="flex items-center justify-center py-24 flex-col gap-3">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#3082A8', borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: '#3D6E8A' }}>Loading leads...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <div className="rounded-full p-4 mb-4" style={{ backgroundColor: 'rgba(48,130,168,0.1)' }}>
                <Users className="w-8 h-8" style={{ color: '#3082A8' }} />
              </div>
              <p className="font-semibold" style={{ color: '#D4EAF7' }}>No leads found</p>
              <p className="text-sm mt-1" style={{ color: '#3D6E8A' }}>
                {leads.length === 0 ? 'Get started by adding your first lead' : 'Try adjusting your filters'}
              </p>
              {leads.length === 0 && <Link href="/leads/new" className="btn-primary mt-4">Add First Lead</Link>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#07111E', borderBottom: '1px solid rgba(48,130,168,0.2)' }}>
                    {['Customer', 'Phone', 'Address', 'Source', 'Status', 'Date of Lead', ''].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#3D6E8A' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(lead => (
                    <tr key={lead.id} className="group transition-colors" style={{ borderBottom: '1px solid rgba(48,130,168,0.1)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(48,130,168,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm"
                            style={{ backgroundColor: 'rgba(48,130,168,0.15)', color: '#4AAECF', border: '1px solid rgba(48,130,168,0.3)' }}>
                            {lead.first_name[0]}{lead.last_name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: '#D4EAF7' }}>{lead.first_name} {lead.last_name}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={lead.type === 'commercial'
                                ? { backgroundColor: 'rgba(100,120,200,0.15)', color: '#9BAEE8' }
                                : { backgroundColor: 'rgba(48,130,168,0.12)', color: '#4AAECF' }}>
                              {lead.type === 'commercial' ? 'Commercial' : 'Residential'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {lead.phone && <div className="flex items-center gap-1.5 text-sm" style={{ color: '#6FA8C8' }}>
                          <Phone className="w-3.5 h-3.5" style={{ color: '#3D6E8A' }} />{lead.phone}
                        </div>}
                      </td>
                      <td className="px-4 py-4">
                        {lead.address && <div className="flex items-center gap-1.5 text-sm max-w-[180px]" style={{ color: '#6FA8C8' }}>
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#3D6E8A' }} />
                          <span className="truncate">{lead.address}</span>
                        </div>}
                      </td>
                      <td className="px-4 py-4"><SourceBadge source={lead.lead_source} /></td>
                      <td className="px-4 py-4"><StatusBadge status={lead.status} /></td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#3D6E8A' }}>
                          <Calendar className="w-3.5 h-3.5" />
                          {lead.lead_date ? format(new Date(lead.lead_date + 'T12:00:00'), 'MMM d, yyyy') : format(new Date(lead.created_at), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setDeleteId(lead.id)}
                            className="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            style={{ color: '#3D6E8A' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E87070'; (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(230,100,100,0.1)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#3D6E8A'; (e.currentTarget as HTMLElement).style.backgroundColor = '' }}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link href={`/leads/${lead.id}`}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                            style={{ color: '#4AAECF' }}
                            onMouseEnter={e => ((e.target as HTMLElement).closest('a')!.style.backgroundColor = 'rgba(48,130,168,0.12)')}
                            onMouseLeave={e => ((e.target as HTMLElement).closest('a')!.style.backgroundColor = '')}>
                            View <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full" style={{ backgroundColor: '#0F2035', border: '1px solid rgba(48,130,168,0.3)' }}>
            <h3 className="font-bold text-lg mb-2" style={{ color: '#D4EAF7' }}>Delete Lead?</h3>
            <p className="text-sm mb-6" style={{ color: '#6FA8C8' }}>This will permanently delete this lead and all notes. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
