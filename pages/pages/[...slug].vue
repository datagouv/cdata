<template>
  <PostView
    v-if="post"
    :post
    :on-refresh="refreshPost"
  />
  <LoadingBlock
    v-else-if="error"
    status="error"
    :data="null"
  />
</template>

<script setup lang="ts">
import { LoadingBlock } from '@datagouv/components-next'
import PostView from '~/components/Posts/PostView.vue'
import type { Post } from '~/types/posts'

const route = useRoute()

const segments = (route.params.slug as string[] | undefined) ?? []
const lastSegment = segments.at(-1)

// An edito page is found by its own slug, the last segment of the path, whatever the
// segments before it: a page moved under another parent keeps answering at its old path
// and gets redirected to its canonical one.
const { data: candidate, error, refresh: refreshPost } = await useAPI<Post>(
  () => `/api/1/posts/${encodeURIComponent(lastSegment ?? '')}/`,
  { immediate: Boolean(lastSegment) },
)
// A news lives under /posts: its slug under /pages is not a page.
const post = computed(() => candidate.value?.kind === 'page' ? candidate.value : null)

if (post.value) {
  await redirectToCanonicalPost(post.value, route)
}
// Any other failure keeps its error message: answering 404 would say the page does not
// exist when it may. `showError` rather than `throw createError`: throwing rejects the
// async setup, and an in-app navigation then renders this page with an empty context.
else if (!lastSegment || candidate.value || error.value?.statusCode === 404) {
  showError({ statusCode: 404, statusMessage: 'Page Not Found' })
}
</script>
