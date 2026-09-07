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
      <TranslationT
        v-if="post.published"
        tag="p"
        class="mb-0 text-gray-medium"
        keypath="Publié le {date}"
      >
        <template #date>
          <FormattedDate :date="post.published" />
        </template>
      </TranslationT>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FormattedDate, TranslationT } from '@datagouv/components-next'
import type { Post } from '~/types/posts'

defineProps<{
  post: Post
}>()
</script>
