import type { Dataservice, Dataset, DatasetV2, Reuse, User } from '@datagouv/components-next'
import type { Post } from './posts'

export type DiscussionSortedBy = 'title' | 'created' | 'closed'

export type Spam = {
  status?: string
}

export type Subject = {
  id: string
  class: string
}

export type Comment = { content: string, posted_by: User, posted_on: string, spam?: Spam }

export type Discussion = Array<Comment>

export type DiscussionSubjectTypes = Dataservice | Dataset | DatasetV2 | Reuse | Post

export type DiscussionSubject = {
  class: 'Dataservice' | 'Dataset' | 'Reuse' | 'Post' | 'Topic' | 'Organization'
  id: string
}

export type NewDiscussion = {
  title: string
  comment: string
  subject: Subject
}

export type CreateDiscussion = (discussion: NewDiscussion) => Promise<Thread>

export type CreateComment = (comment: string) => Promise<Thread>

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
}
