import type { Organization, User } from '@datagouv/components-next'

export type ActivityKey = 'dataset:created' | 'dataset:updated' | 'dataset:deleted' | 'dataset:discussed' | 'dataset:followed'
  | 'organization:created' | 'organization:updated' | 'organization:followed'
  | 'reuse:created' | 'reuse:updated' | 'reuse:deleted' | 'reuse:discussed' | 'reuse:followed'
  | 'user:followed'

export type Activity = {
  actor: User
  organization: Organization | null
  related_to: string
  related_to_id: string
  related_to_kind: string
  related_to_url: string
  created_at: string
  label: string
  key: ActivityKey
  icon: string
  extras: Record<string, any>
}
