import type { OrganizationReference } from './organizations'
import type { UserReference } from './users'

export type ActivityKey = 'dataset:created' | 'dataset:updated' | 'dataset:deleted' | 'dataset:discussed' | 'dataset:followed'
  | 'dataset:resource:added' | 'dataset:resource:updated' | 'dataset:resource:deleted'
  | 'dataservice:created' | 'dataservice:updated' | 'dataservice:deleted' | 'dataservice:discussed' | 'dataservice:followed'
  | 'organization:created' | 'organization:updated' | 'organization:followed'
  | 'reuse:created' | 'reuse:updated' | 'reuse:deleted' | 'reuse:discussed' | 'reuse:followed'
  | 'user:followed' | 'topic:created' | 'topic:updated'

/**
 * Who an action is attributed to. Not necessarily a person: harvesting acts on its own
 * behalf, an API token or an application's OAuth2 token on behalf of its owner. `class`
 * is the discriminator every API reference carries.
 */
export type ActivityActor
  = | UserReference
    | {
      class: 'HarvestSource'
      id: string
      /** Null once the source has been purged. */
      name: string | null
    }
    | {
      class: 'ApiToken'
      id: string
      owner: UserReference
      /** Only sent to the token owner and to sysadmins; a token may also have no name. */
      name: string | null
    }
    | {
      class: 'OAuth2Token'
      id: string
      owner: UserReference
      client: { class: 'OAuth2Client', id: string, name: string }
    }

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
