<template>
  <ObjectCard media-size="lg">
    <template #media>
      <CardMedia :src="post.image" :alt="post.name" kind="post" />
    </template>

    <ObjectCardHeader :icon="RiArticleLine" :url="postUrl || post.page || '#'">
      {{ post.name }}
    </ObjectCardHeader>

    <TranslationT
      v-if="post.published || post.created_at"
      tag="div"
      class="card-date"
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
    <ObjectCardShortDescription :text="post.headline || post.content" />

    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { RiArticleLine } from '@remixicon/vue'
import type { RouteLocationRaw } from 'vue-router'
import type { Post } from '../types/posts'
import CardMedia from './CardMedia.vue'
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

<style scoped>
.card-date {
  color: #555;
  font-size: 0.875rem;
  line-height: 1.5rem;
  font-variant-numeric: tabular-nums;
}
</style>
