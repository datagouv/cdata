import type { Harvest } from './harvest'
import type { Owned, OwnedWithId } from './owned'
import type { ContactPoint } from './contact_point'

export type BaseDataservice = Owned & {
  acronym: string
  authorization_request_url: string | null
  availability: number | null
  base_api_url: string | null
  datasets: Array<{
    class: string
    id: string
    acronym: string
    page: string
    title: string
    uri: string
  }>
  description: string
  machine_documentation_url: string | null
  technical_documentation_url: string | null
  business_documentation_url: string | null
  access_type: 'open' | 'restricted' | 'open_with_account'
  license: string | null
  private: boolean
  rate_limiting: string
  title: string
  contact_points: Array<ContactPoint>
}

export type NewDataservice = Omit<BaseDataservice, keyof OwnedWithId> & OwnedWithId

export type DataserviceAccessAudienceCondition = 'yes' | 'no' | 'under_condition'

export type DataserviceAccessAudienceType = 'local_authority_and_administration' | 'company_and_association' | 'private'

export type DataserviceAccessAudience = { role: DataserviceAccessAudienceType, condition: DataserviceAccessAudienceCondition }

export type Dataservice = Owned & {
  acronym: string
  archived_at: string | null
  authorization_request_url: string | null
  availability: number | null
  base_api_url: string | null
  contact_points: Array<ContactPoint>
  created_at: string
  datasets: Array<{
    class: string
    id: string
    acronym: string
    page: string
    title: string
    uri: string
  }>
  deleted_at: string | null
  description: string
  featured: boolean
  machine_documentation_url: string | null
  technical_documentation_url: string | null
  business_documentation_url: string | null
  extras: Record<string, unknown>
  format: string
  harvest: Harvest
  id: string
  access_type: 'open' | 'restricted' | 'open_with_account'
  access_audiences: Array<DataserviceAccessAudience>
  license: string | null
  metadata_modified_at: string
  metrics: {
    discussions: number
    discussions_open: number
    followers: number
    reuses: number
    views: number
  }
  permissions: { edit: boolean, delete: boolean }
  private: boolean
  rate_limiting: string
  self_api_url: string
  self_web_url: string
  slug: string
  tags: Array<string>
  title: string
}
