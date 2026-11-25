import type { Post, PostAncestor } from '@datagouv/components-next'

export type { Post, PostAncestor }

export type NewPostForApi = Omit<Post, 'id' | 'last_modified' | 'created_at' | 'datasets' | 'reuses' | 'page' | 'url' | 'ancestors'>

export type PostForm = Omit<NewPostForApi, 'image' | 'tags' | 'datasets' | 'reuses'> & {
  image: string | File | null
  tags: Array<{ text: string }>
}
