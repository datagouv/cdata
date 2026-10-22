<template>
  <LoadingBlock
    v-slot="{ data: post }"
    :status="status"
    :data="post"
  >
    <PostView
      :post
      :on-refresh="refreshPost"
    />
  </LoadingBlock>
</template>

<script setup lang="ts">
import { LoadingBlock } from '@datagouv/components-next'
import PostView from '~/components/Posts/PostView.vue'
import type { Post } from '~/types/posts'

const route = useRoute()

const url = computed(() => `/api/1/posts/${route.params.id}/`)
const { data: post, status, refresh: refreshPost } = await useAPI<Post>(url, { showErrorPage: true })

if (post.value) {
  await redirectToCanonicalPost(post.value, route)
}
</script>
