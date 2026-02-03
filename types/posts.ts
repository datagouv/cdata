import type { Post } from '@datagouv/components-next'

export type { Post }

export type NewPostForApi = Omit<Post, 'id' | 'last_modified' | 'created_at' | 'datasets' | 'reuses' | 'page' | 'slug' | 'url' | 'content_as_page'> & {
  content_as_page: string | null
}

export type PostForm = Omit<NewPostForApi, 'image' | 'tags' | 'datasets' | 'reuses'> & {
  image: string | File | null
  tags: Array<{ text: string }>
}
