import type { User } from './users'
import type { Badges } from './badges'

export type MemberRole = 'admin' | 'editor'

export type Member = {
  role: MemberRole
  label: string
  user: User
  since: string | null
}

export type OrganizationSuggest = { id: string, image_url: string, name: string }

export type OrganizationOrSuggest = Organization | OrganizationReference | OrganizationSuggest

export type NewOrganization = {
  acronym: string | null
  name: string
  business_number_id: string | null
  description: string
  url: string | null
  logo: string
}

export type OrganizationReference = {
  id: string
  name: string
  acronym: string | null
  slug: string
  uri: string
  page: string
  logo: string
  logo_thumbnail: string
  badges: Badges
}

export type Organization = OrganizationReference & {
  url: string // URL of the org website
  description: string
  business_number_id: string
  created_at: string
  last_modified: string
  deleted: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extras: Record<string, any>
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
}
