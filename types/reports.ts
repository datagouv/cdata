import type { User } from '@datagouv/components-next'

export type ReportSubject = {
  id: string
  class: 'Dataset' | 'Dataservice' | 'Reuse' | 'Organization' | 'Discussion'
}

export type ReportReason = {
  id: string
  label: string
  value: string
}

export type Report = {
  id: string
  subject: ReportSubject | null
  subject_deleted_at: string | null
  by: User | null
  reason: string
  message: string
  reported_at: string
  dismissed_at: string | null
}
