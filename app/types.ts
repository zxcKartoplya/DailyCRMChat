export interface User {
  id: number
  name: string
  email: string | null
  role: 'admin' | 'employee'
  status: 'active' | 'inactive' | 'invited'
  department_id: number | null
  department_name: string | null
  job_id: number | null
  created_at: string
  updated_at: string
}

export interface InternalChatMessage {
  id: number
  user_id: number
  message_text: string
  created_at: string
  parsed_to_daily_report: boolean
  daily_report_id: number | null
}

export interface InternalChatDailyReportPayload {
  report_date?: string
  yesterday_text?: string
  today_text?: string
  blockers_text?: string
  mood?: string
  self_rating?: number
  needs_help?: boolean
  source?: 'internal_web'
  status?: 'draft' | 'submitted'
}

export interface InternalChatMessageCreate {
  message_text: string
  daily_report?: InternalChatDailyReportPayload | null
}

export interface DailyReport {
  id: number
  user_id: number
  department_id: number | null
  report_date: string
  yesterday_text: string | null
  today_text: string | null
  blockers_text: string | null
  mood: string | null
  self_rating: number | null
  needs_help: boolean
  source: string
  status: 'draft' | 'submitted' | 'imported'
  submitted_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: 'bearer'
  user: User
}
