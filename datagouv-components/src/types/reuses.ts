import type { Owned, OwnedWithId } from './owned'
import type { Dataset } from './datasets'
import type { Badges } from './badges'
import type { Dataservice } from './dataservices'

export type BaseReuse = Owned & {
  title: string
  description: string
  tags: Array<string> | null
  datasets: Array<Dataset | string>
  topic: string
  type: string
  url: string
  private: boolean
}

export type NewReuse = Omit<BaseReuse, keyof OwnedWithId> & OwnedWithId

export type Reuse = BaseReuse & {
  badges: Badges
  created_at: string
  datasets: Array<Dataset>
  dataservices: Array<Dataservice>
  archived: string | null
  deleted: string | null
  extras: Record<string, unknown>
  featured: boolean
  id: string
  image: string | null
  image_thumbnail: string | null
  last_modified: string
  metrics: {
    datasets: number
    discussions: number
    discussions_open: number
    followers: number
    views: number
  }
  slug: string
  page: string
  uri: string
  permissions: { edit: boolean, delete: boolean }
}

export type ReuseType = {
  id: string
  label: string
}

export type ReuseTopic = {
  id: string
  label: string
}
