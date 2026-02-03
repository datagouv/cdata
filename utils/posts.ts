import cloneDeep from 'lodash-es/cloneDeep'
import type { NewPostForApi, Post, PostForm } from '~/types/posts'

export function postToForm(post: Post): PostForm {
  const contentAsPageId = post.content_as_page
    ? (typeof post.content_as_page === 'string' ? post.content_as_page : post.content_as_page.id)
    : null

  return {
    ...cloneDeep(post),
    tags: post.tags.map(text => ({ text })),
    image: post.image as string | File,
    content_as_page: contentAsPageId,
  }
}

export function postToApi(form: PostForm): NewPostForApi {
  return {
    ...form,
    tags: form.tags.map(({ text }) => text),
    image: null,
  }
}
