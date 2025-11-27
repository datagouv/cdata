import type { User } from './users'

export type ReportSubject = {
  class: 'Discussion' | 'Dataservice' | 'Dataset' | 'Organization' | 'Reuse'
  id: string
}

type ReportReasonValue = string & { readonly __brand: 'ReportReasonValue' }

export type ReportReason = {
  label: string
  value: ReportReasonValue
}

export type Report = {
  id: string
  by: User | null
  subject: ReportSubject | null
  reason: ReportReasonValue
  message: string
  reported_at: string
  self_api_url: string
  subject_deleted_at: string | null
  dismissed_at: string | null
  dismissed_by: User | null
}
