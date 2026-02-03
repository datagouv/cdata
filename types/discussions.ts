import type { DataserviceReference, DatasetReference, OrganizationReference, ReuseReference, UserReference } from '@datagouv/components-next'
import type { Post } from './posts'

export type DiscussionSortedBy = 'title' | 'created' | 'closed'

export type Spam = {
  status?: 'not_checked' | 'no_spam' | 'potential_spam'
}

export type Subject = {
  id: string
  class: string
}

export type DiscussionSubjectTypes = DataserviceReference | DatasetReference | ReuseReference | Post

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
  title: string
  user: UserReference
  organization: OrganizationReference | null
  created: string
  closed: string
  closed_by: UserReference | null
  closed_by_organization: OrganizationReference | null
  discussion: Discussion
  url: string
  self_web_url: string
  spam?: Spam
  subject: DiscussionSubject
  permissions: { delete: boolean, edit: boolean, close: boolean }
}

export type Comment = {
  content: string
  posted_by: UserReference
  posted_on: string
  posted_by_organization: OrganizationReference | null
  last_modified_at?: string | null
  spam?: Spam
  permissions: { delete: boolean, edit: boolean }
}

export type Discussion = Array<Comment>
