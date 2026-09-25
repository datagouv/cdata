import type { OrganizationReference } from './organizations'
import type { UserReference } from './users'

export type ActivityKey = 'dataset:created' | 'dataset:updated' | 'dataset:deleted' | 'dataset:discussed' | 'dataset:followed'
  | 'dataset:resource:added' | 'dataset:resource:updated' | 'dataset:resource:deleted'
  | 'dataservice:created' | 'dataservice:updated' | 'dataservice:deleted' | 'dataservice:discussed' | 'dataservice:followed'
  | 'organization:created' | 'organization:updated' | 'organization:followed'
  | 'reuse:created' | 'reuse:updated' | 'reuse:deleted' | 'reuse:discussed' | 'reuse:followed'
  | 'user:followed' | 'topic:created' | 'topic:updated'

/**
 * Who an action is attributed to. Not necessarily a person: harvesting and API tokens
 * act on their own behalf. `class` is the discriminator every API reference carries.
 */
export type ActivityActor
  = | UserReference
    | { class: 'HarvestSource', id: string, name: string }
    | { class: 'ApiToken', id: string, name: string }

export type ActivityExtras = {
  /** Set on the `dataset:resource:*` keys. */
  resource_id?: string
  /**
   * Copied when the activity is emitted, so a resource removed or renamed since still
   * reads under the name it had that day. Absent from the activities recorded before
   * the backend started storing it.
   */
  resource_title?: string
}

export type Activity = {
  actor: ActivityActor
  organization: OrganizationReference | null
  related_to: string
  related_to_id: string
  related_to_kind: string
  related_to_url: string
  created_at: string
  label: string
  key: ActivityKey
  icon: string
  extras: ActivityExtras
  changes?: Array<string>
}
