<template>
  <div class="max-w-[38rem] hover:bg-neutral-200 fr-enlarge-link">
    <div v-if="post.image">
      <img
        :src="post.image"
        alt=""
      >
    </div>
    <div class="p-4">
      <p class="text-lg mb-2.5 font-bold">
        <CdataLink
          :to="post.page"
        >
          {{ post.name }}
        </CdataLink>
      </p>
      <p
        v-if="post.published"
        class="mb-0 text-gray-medium"
      >
        {{ $t('Publié le {date}', { date: formatDate(post.published) }) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormatDate } from '@datagouv/components-next'
import type { Post } from '~/types/posts'

defineProps<{
  post: Post
}>()

const { formatDate } = useFormatDate()
</script>
