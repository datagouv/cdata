import type { Rel } from './datasets'
import type { Owned } from './owned'

export type TopicV2 = Owned & {
  id: string
  name: string
  slug: string
  description: string
  tags: Array<string>
  datasets: Rel
  reuses: Rel
  featured: boolean
  private: boolean
  created_at: string
  last_modified: string

  uri: string
  page: string
  extras: Record<string, unknown>
}
