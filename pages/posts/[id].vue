<template>
  <LoadingBlock
    v-slot="{ data: post }"
    :status="status"
    :data="post"
  >
    <PostView
      :post
      @refresh="refreshPost"
    />
  </LoadingBlock>
</template>

<script setup lang="ts">
import { LoadingBlock } from '@datagouv/components-next'
import PostView from '~/components/Posts/PostView.vue'
import type { Post } from '~/types/posts'

const route = useRoute()

const url = computed(() => `/api/1/posts/${route.params.id}/`)
// Not lazy: a page must be redirected from the server response, before anything renders.
const { data: post, status, refresh: refreshPost } = await useAPI<Post>(url, { redirectOn404: true })

// Pages live under /pages/<path>: their /posts/<slug> URL only redirects there.
if (post.value?.kind === 'page') {
  await navigateTo({ path: `/pages/${post.value.path}`, query: route.query }, { redirectCode: 301, replace: true })
}
</script>
