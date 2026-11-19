import type { OrganizationReference } from './organizations'

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

export type ProConnectIdentity = {
  sub: string
  // Whether the last login with this identity presented a second factor held by the agent.
  second_factor: boolean
  // When this identity was trusted as the account holder's, null until then.
  verified_at: string | null
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
  email?: string
  about: string
  website?: string
  roles?: Array<string>
  organizations: Array<OrganizationReference>
  last_login_at: string | null
  password_rotation_demanded: string | null
  password_rotation_performed: string | null
  // Given to the user themselves and to sysadmins only, null otherwise.
  has_password: boolean | null
  has_two_factor: boolean | null
  proconnect: ProConnectIdentity | null
  // Whether this session may drop the password and the udata 2FA of the account.
  can_switch_to_proconnect_only: boolean | null
  since: string | null
  metrics: {
    datasets: number
    dataservices: number
    reuses: number

    followers: number
    following: number
  }
}
