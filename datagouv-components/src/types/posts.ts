import type { Dataset } from './datasets'
import type { PageBloc } from './pages'
import type { Reuse } from './reuses'
import type { User } from './users'

export type PostAncestor = Pick<Post, 'id' | 'name' | 'page'>

export type Post = {
  ancestors: Array<PostAncestor>
  body_type: 'markdown' | 'html' | 'blocs'
  blocs: Array<PageBloc>
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
  parent: PostAncestor | null
  published: string | null
  reuses: Array<Pick<Reuse, 'id' | 'image' | 'image_thumbnail' | 'page' | 'title' | 'uri'>>
  sidemenu: boolean
  slug: string
  tags: Array<string>
  url: string
}
