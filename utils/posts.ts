import cloneDeep from 'lodash-es/cloneDeep'
import type { NewPostForApi, Post, PostForm } from '~/types/posts'

// The canonical path of a post is decided by the API (`/pages/<path>` for a page,
// `/posts/<slug>` for a news): its `page` URL is absolute, built on the cdata base URL.
export function postPath(post: Pick<Post, 'page'>): string {
  return new URL(post.page).pathname
}

export function postToForm(post: Post): PostForm {
  return {
    ...cloneDeep(post),
    tags: post.tags.map(text => ({ text })),
    image: post.image as string | File,
  }
}

export function postToApi(form: PostForm): NewPostForApi {
  return {
    ...form,
    tags: form.tags.map(({ text }) => text),
    image: null,
    // A parent picked before switching the kind to news would be rejected by the API.
    parent: form.kind === 'page' ? form.parent : null,
  }
}
