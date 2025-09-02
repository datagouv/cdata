import type { User } from './users'
import type { Badges } from './badges'

export type MemberRole = 'admin' | 'editor'

export type Member = {
  role: MemberRole
  label: string
  user: User
  since: string | null
}

export type NewOrganization = {
  acronym: string | null
  name: string
  business_number_id: string | null
  description: string
  url: string | null
  logo: string
}

export type Organization = NewOrganization & {
  id: string
  created_at: string
  last_modified: string
  last_update: string
  deleted: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extras: Record<string, any>
  logo_thumbnail: string
  members: Array<Member>
  metrics: {
    dataservices: number
    dataservices_by_months: Record<string, number>
    datasets: number
    datasets_by_months: Record<string, number>
    followers: number
    members: number
    reuses: number
    reuses_by_months: Record<string, number>
    views: number
  }
  page: string
  slug: string
  uri: string
  badges: Badges
}
