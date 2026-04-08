export type LeadSource = 'google-mb' | 'google-maps' | 'angi' | 'thumbtack' | 'facebook' | 'instagram' | 'linkedin' | 'other'
export type LeadType = 'residential' | 'commercial'
export type LeadStatus = 'new' | 'contacted' | 'waiting-response' | 'quoted' | 'passed-to-sales' | 'won' | 'lost'

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
  other_source?: string
  passed_to?: string
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
  'google-mb': 'Google My Business',
  'google-maps': 'Google Maps',
  'angi': 'Angi',
  'thumbtack': 'Thumbtack',
  'facebook': 'Facebook',
  'instagram': 'Instagram',
  'linkedin': 'LinkedIn',
  'other': 'Other',
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  'waiting-response': 'Waiting Response',
  quoted: 'Quoted',
  'passed-to-sales': 'Passed Off to Sales',
  won: 'Won',
  lost: 'Lost',
}
