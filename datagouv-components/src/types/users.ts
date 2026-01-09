import type { Organization } from './organizations'

export type UserReference = {
  class: 'User'
  id: string
  first_name: string
  last_name: string
  slug: string
  uri: string
  page: string
  avatar: string
  avatar_thumbnail: string
}

export type User = {
  id: UserReference['id']
  first_name: UserReference['first_name']
  last_name: UserReference['last_name']
  slug: UserReference['slug']
  uri: UserReference['uri']
  page: UserReference['page']
  avatar: UserReference['avatar']
  avatar_thumbnail: UserReference['avatar_thumbnail']
  apikey?: string
  email?: string
  about: string
  website?: string
  roles?: Array<string>
  organizations: Array<Organization>
  last_login_at: string | null
  since: string | null
  metrics: {
    datasets: number
    dataservices: number
    reuses: number

    followers: number
    following: number
  }
}
