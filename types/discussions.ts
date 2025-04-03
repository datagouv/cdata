import type { Dataservice, Dataset, Reuse, User } from '@datagouv/components-next'
import type { Post } from './posts'

export type DiscussionSortedBy = 'title' | 'created' | 'closed'

export type Spam = {
  status?: string
}

export type DiscussionSubjectTypes = Dataservice | Dataset | Reuse | Post

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
  spam?: Spam
  subject: DiscussionSubject
  permissions: { delete: boolean, close: boolean }
}

export type Comment = { content: string, posted_by: User, posted_on: string, last_edit_at?: string | null, spam?: Spam, permissions: { delete: boolean, edit: boolean } }

export type Discussion = Array<Comment>
