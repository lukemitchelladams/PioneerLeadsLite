export type LeadSource = 'walk-in' | 'phone-call' | 'google-mb' | 'angi' | 'thumbtack' | 'other'
export type LeadType = 'residential' | 'commercial'
export type LeadStatus = 'new' | 'contacted' | 'waiting-response' | 'quoted' | 'won' | 'lost'

export interface Lead {
  id: string
  created_at: string
  updated_at: string
  lead_date: string
  first_name: string
  last_name: string
  phone: string
  email?: string
  address: string
  type: LeadType
  lead_source: LeadSource
  status: LeadStatus
}

export interface LeadNote {
  id: string
  created_at: string
  lead_id: string
  content: string
  user_id?: string
}

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  'walk-in': 'Walk-In',
  'phone-call': 'Phone Call',
  'google-mb': 'Google My Business',
  'angi': 'Angi',
  'thumbtack': 'Thumbtack',
  'other': 'Other',
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  'waiting-response': 'Waiting Response',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
}
