import type { Dataset, Reuse, User } from '@datagouv/components-next'

export type Post = {
  body_type: 'markdown' | 'html'
  content: string
  created_at: string
  credit_to: string
  credit_url: string
  datasets: Array<Pick<Dataset, 'acronym' | 'id' | 'page' | 'title' | 'uri'>>
  headline: string
  id: string
  image: string | null
  kind: 'news' | 'page'
  last_modified: string
  name: string
  owner: User
  page: string
  published: string | null
  reuses: Array<Pick<Reuse, 'id' | 'image' | 'image_thumbnail' | 'page' | 'title' | 'uri'>>
  slug: string
  tags: Array<string>
  url: string
}

export type NewPostForApi = Omit<Post, 'id' | 'last_modified' | 'created_at' | 'datasets' | 'reuses' | 'page' | 'slug' | 'url'>

export type PostForm = Omit<NewPostForApi, 'image' | 'tags' | 'datasets' | 'reuses'> & {
  image: string | File | null
  tags: Array<{ text: string }>
}
