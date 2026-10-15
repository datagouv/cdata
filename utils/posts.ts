import cloneDeep from 'lodash-es/cloneDeep'
import type { NewPostForApi, Post, PostForm } from '~/types/posts'

// Shared by the admin post layout and its metadata tab, so both read one useAsyncData
// entry: saving the metadata refreshes the title and the "Voir la page" link of the layout.
export function adminPostKey(postId: string): string {
  return `admin-post-${postId}`
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
  }
}
