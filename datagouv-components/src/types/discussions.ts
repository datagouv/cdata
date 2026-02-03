import type { OrganizationReference } from './organizations'
import type { UserReference } from './users'

export type Comment = {
  content: string
  posted_by: UserReference
  posted_on: string
  posted_by_organization: OrganizationReference | null
  last_modified_at?: string | null
}

export interface Thread {
  id: string
  title: string
  user: UserReference
  organization: OrganizationReference | null
  created: string
  discussion: Array<Comment>
  self_web_url?: string
}
