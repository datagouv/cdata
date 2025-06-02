<template>
  <div class="max-w-[38rem] hover:bg-neutral-200 fr-enlarge-link">
    <div v-if="post.image">
      <img :src="post.image">
    </div>
    <div class="p-4">
      <p class="text-lg mb-2.5 font-bold">
        <NuxtLinkLocale
          :to="`/posts/${post.slug}/`"
        >
          {{ post.name }}
        </NuxtLinkLocale>
      </p>
      <p
        v-if="post.published"
        class="mb-0 text-gray-medium"
      >
        {{ $t('Published the {date}', { date: formatDate(post.published) }) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '@datagouv/components-next'
import type { Post } from '~/types/posts'

defineProps<{
  post: Post
}>()
</script>
