import type { Dataservice, Dataset, DatasetV2, Organization, Reuse, User } from '@datagouv/components-next'
import type { Post } from './posts'

export type DiscussionSortedBy = 'title' | 'created' | 'closed'

export type Spam = {
  status?: string
}

export type Subject = {
  id: string
  class: string
}

export type DiscussionSubjectTypes = Dataservice | Dataset | DatasetV2 | Reuse | Post

export type DiscussionSubject = {
  class: 'Dataservice' | 'Dataset' | 'Reuse' | 'Post' | 'Topic' | 'Organization'
  id: string
}

export type NewDiscussion = {
  title: string
  comment: string
  subject: DiscussionSubject
}

export type Thread = {
  id: string
  discussion: Discussion
  title: string
  url: string
  created: string
  closed: string
  closed_by: User
  closed_by_organization: Organization | null
  spam?: Spam
  subject: DiscussionSubject
  permissions: { delete: boolean, edit: boolean, close: boolean }
}

export type Comment = {
  content: string
  posted_by: User
  posted_on: string
  posted_by_organization: Organization | null
  last_modified_at?: string | null
  spam?: Spam
  permissions: { delete: boolean, edit: boolean }
}

export type Discussion = Array<Comment>
