import cloneDeep from 'lodash-es/cloneDeep'
import type { NewPostForApi, Post, PostForm } from '~/types/posts'

export function postToForm(post: Post): PostForm {
  return {
    ...cloneDeep(post),
    tags: post.tags.map(text => ({ text })),
    image: post.image as string | File,
  }
}

export function toApi(form: PostForm): NewPostForApi {
  return {
    ...form,
    tags: form.tags.map(({ text }) => text),
    image: null,
  }
}
