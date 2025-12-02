import type { Organization } from './organizations'

export type UserReference = {
  id: string
  first_name: string
  last_name: string
  slug: string
  uri: string
  page: string
  avatar: string
  avatar_thumbnail: string
}

export type User = UserReference & {
  apikey?: string
  email?: string
  about: string
  website?: string
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
