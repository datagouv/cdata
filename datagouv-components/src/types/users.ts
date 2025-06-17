import type { Organization } from "./organizations"

export type User = {
  id: string
  slug?: string
  first_name: string
  last_name: string
  about: string
  avatar?: string | null
  page: string
  avatar_thumbnail?: string | null
  roles?: Array<string>
  organizations: Array<Organization>
  metrics: {
    datasets: number
    dataservices: number
    reuses: number

    followers: number
    following: number
  }
}
