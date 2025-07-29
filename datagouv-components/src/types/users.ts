import type { Organization } from './organizations'

export type User = {
  id: string
  apikey?: string
  slug?: string
  email?: string
  first_name: string
  last_name: string
  about: string
  avatar?: string | null
  website?: string
  page: string
  avatar_thumbnail?: string | null
  roles?: Array<string>
  organizations: Array<Organization>
  last_login_at: string | null
  metrics: {
    datasets: number
    dataservices: number
    reuses: number

    followers: number
    following: number
  }
}
