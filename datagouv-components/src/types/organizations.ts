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
  class: 'Organization'
  id: string
  name: string
  acronym: string | null
  slug: string
  uri: string
  page: string
  logo: string
  logo_thumbnail: string
  badges: Badges
  permissions: { delete: boolean, edit: boolean, harvest: boolean, members: boolean, private: boolean }
}

export type Organization = {
  id: OrganizationReference['id']
  name: OrganizationReference['name']
  acronym: OrganizationReference['acronym']
  slug: OrganizationReference['slug']
  uri: OrganizationReference['uri']
  page: OrganizationReference['page']
  logo: OrganizationReference['logo']
  logo_thumbnail: OrganizationReference['logo_thumbnail']
  badges: OrganizationReference['badges']
  permissions: OrganizationReference['permissions']
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
