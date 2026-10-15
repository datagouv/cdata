<template>
  <PostView
    v-if="post"
    :post
    @refresh="refreshPost"
  />
  <LoadingBlock
    v-else-if="apiFailed"
    status="error"
    :data="null"
  />
  <GithubPage
    v-else
    :slug
  />
</template>

<script setup lang="ts">
import { LoadingBlock } from '@datagouv/components-next'
import GithubPage from '~/components/Pages/GithubPage.vue'
import PostView from '~/components/Posts/PostView.vue'
import type { Post } from '~/types/posts'

const route = useRoute()

const segments = (route.params.slug as string[] | undefined) ?? []
const slug = segments.join('/')
const lastSegment = segments.at(-1)

// An edito page is found by its own slug, the last segment of the path, whatever the
// segments before it: a page moved under another parent keeps answering at its old path
// and gets redirected to its canonical one. The GitHub pages are the fallback for the
// paths not migrated yet.
const { data: candidate, error, refresh: refreshPost } = await useAPI<Post>(
  () => `/api/1/posts/${encodeURIComponent(lastSegment ?? '')}/`,
  { immediate: Boolean(lastSegment) },
)
const post = computed(() => candidate.value?.kind === 'page' ? candidate.value : null)
// Only a 404 means "not migrated": on any other failure, falling back to GitHub would
// answer 404 for a page that may exist.
const apiFailed = computed(() => Boolean(error.value) && error.value?.statusCode !== 404)

if (post.value) {
  await redirectToCanonicalPost(post.value, route)
}
</script>
