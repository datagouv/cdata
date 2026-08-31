<template>
  <ObjectCard media-size="lg">
    <template #media>
      <img
        v-if="post.image"
        :src="post.image"
        class="w-full h-full object-cover"
        :alt="post.name"
      >
      <Placeholder
        v-else
        type="Dataset"
        class="w-full h-full"
      />
    </template>

    <ObjectCardHeader
      :icon="RiArticleLine"
      :url="postUrl || post.page || '#'"
    >
      {{ post.name }}
    </ObjectCardHeader>

    <ObjectCardShortDescription :text="post.headline || post.content" />

    <TranslationT
      v-if="post.published || post.created_at"
      tag="div"
      class="text-sm text-gray-medium mt-1"
      keypath="Publié {date}"
    >
      <template #date>
        <FormattedDate
          :date="post.published || post.created_at"
          format="relative"
          :options="{ dateStyle: 'long', timeStyle: 'short' }"
        />
      </template>
    </TranslationT>

    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { RiArticleLine } from '@remixicon/vue'
import type { RouteLocationRaw } from 'vue-router'
import type { Post } from '../types/posts'
import Placeholder from './Placeholder.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardHeader from './ObjectCardHeader.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import FormattedDate from './FormattedDate.vue'
import TranslationT from './TranslationT.vue'

defineProps<{
  post: Post
  postUrl?: RouteLocationRaw
}>()
</script>
