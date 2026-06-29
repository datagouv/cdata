import type { Owned, OwnedWithId } from './owned'
import type { Dataset, Rel } from './datasets'
import type { Badges } from './badges'
import type { Dataservice } from './dataservices'

export type ReuseReference = {
  class: 'Reuse'
  id: string
  title: string
  image: string | null
  uri: string
  page: string
}

export type BaseReuse = Owned & {
  title: ReuseReference['title']
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
  id: ReuseReference['id']
  image: ReuseReference['image']
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
  page: ReuseReference['page']
  uri: ReuseReference['uri']
  permissions: { edit: boolean, delete: boolean }
}

/**
 * Lightweight reuse returned by the listing endpoints (`/api/2/reuses/` and
 * `/api/2/reuses/search/`): the `datasets` and `dataservices` reference lists
 * are replaced by links to their respective listing endpoints filtered on this
 * reuse, so that listing reuses does not dereference every linked dataset.
 */
export type ReuseV2 = Owned & Omit<Reuse, 'datasets' | 'dataservices'> & {
  datasets: Rel
  dataservices: Rel
}

export type ReuseType = {
  id: string
  label: string
}

export type ReuseTopic = {
  id: string
  label: string
}
