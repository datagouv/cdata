import type { Rel } from './datasets'
import type { Owned } from './owned'

export type TopicElementClass = 'Dataset' | 'Reuse'

export type TopicElementRel = {
  id: string
  class: TopicElementClass
}

export type TopicElement = {
  id: string
  title?: string
  description?: string
  tags: Array<string>
  extras: Record<string, unknown>
  element: TopicElementRel
}

export type TopicV2 = Owned & {
  id: string
  name: string
  slug: string
  description: string
  tags: Array<string>
  elements: Rel
  featured: boolean
  private: boolean
  created_at: string
  last_modified: string

  uri: string
  page: string
  extras: Record<string, unknown>
}
