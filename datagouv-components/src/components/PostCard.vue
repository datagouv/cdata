<template>
  <ObjectCard
    :url="postUrl || post.page || '#'"
    :icon="RiArticleLine"
    media-size="lg"
  >
    <template #media>
      <CardMedia
        :src="post.image"
        :alt="post.name"
        kind="post"
      />
    </template>
    <template #title>
      {{ post.name }}
    </template>

    <ObjectCardMeta v-if="post.published || post.created_at">
      <TranslationT
        tag="span"
        class="tabular-nums"
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
    </ObjectCardMeta>
    <ObjectCardShortDescription
      :text="post.headline || post.content"
      class="max-md:hidden"
    />
    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { RiArticleLine } from '@remixicon/vue'
import type { RouteLocationRaw } from 'vue-router'
import type { Post } from '../types/posts'
import CardMedia from './CardMedia.vue'
import FormattedDate from './FormattedDate.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardMeta from './ObjectCardMeta.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import TranslationT from './TranslationT.vue'

defineProps<{
  post: Post
  postUrl?: RouteLocationRaw
}>()
</script>
