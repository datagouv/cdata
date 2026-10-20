import cloneDeep from 'lodash-es/cloneDeep'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { NewPostForApi, Post, PostForm } from '~/types/posts'

// Any URL leading to the post but its canonical one redirects there: a page reached by
// its /posts URL or a stale path, a news reached through a previous slug.
export async function redirectToCanonicalPost(post: Pick<Post, 'page'>, route: RouteLocationNormalizedLoaded) {
  const path = useAbsoluteUrlToRelative()(post.page)
  if (route.path !== path) {
    await navigateTo({ path, query: route.query, hash: route.hash }, { redirectCode: 301, replace: true })
  }
}

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
    // A parent picked before switching the kind to news would be rejected by the API.
    parent: form.kind === 'page' ? form.parent : null,
  }
}
