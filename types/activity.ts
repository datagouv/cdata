import type { Organization, User } from '@datagouv/components-next'

export type ActivityKey = 'dataset:created' | 'dataset:updated' | 'dataset:deleted' | 'dataset:discussed' | 'dataset:followed'
  | 'dataset:resource:added' | 'dataset:resource:updated' | 'dataset:resource:deleted'
  | 'dataservice:created' | 'dataservice:updated' | 'dataservice:deleted' | 'dataservice:discussed' | 'dataservice:followed'
  | 'organization:created' | 'organization:updated' | 'organization:followed'
  | 'reuse:created' | 'reuse:updated' | 'reuse:deleted' | 'reuse:discussed' | 'reuse:followed'
  | 'user:followed' | 'topic:created' | 'topic:updated'

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
  changes?: Array<string>
}
