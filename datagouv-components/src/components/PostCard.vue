<template>
  <ObjectCard>
    <template #media>
      <div
        class="flex justify-center items-center border border-gray-lower bg-[#fff] rounded-md overflow-hidden"
        style="width: 240px; height: 160px;"
      >
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
      </div>
    </template>

    <h4 class="w-full text-base mb-0 flex">
      <AppLink
        :to="postUrl"
        class="text-gray-title text-base bg-none flex items-center w-full truncate gap-1"
      >
        <RiArticleLine
          aria-hidden="true"
          class="size-4 flex-none"
        />
        <span class="block truncate flex-1">{{ post.name }}</span>
        <span class="absolute inset-0" />
      </AppLink>
    </h4>

    <p
      v-if="descriptionShort"
      class="fr-text--sm fr-mt-1w fr-mb-0 overflow-wrap-anywhere hidden sm:block line-clamp-2"
    >
      {{ descriptionShort }}
    </p>

    <div
      v-if="post.published || post.created_at"
      class="text-sm text-gray-medium mt-1"
    >
      {{ t('Publié {date}', { date: formatDate(post.published || post.created_at!) }) }}
    </div>

    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { RiArticleLine } from '@remixicon/vue'
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { removeMarkdownSync } from '../functions/markdown'
import { useFormatDate } from '../functions/dates'
import { useTranslation } from '../composables/useTranslation'
import type { Post } from '../types/posts'
import AppLink from './AppLink.vue'
import Placeholder from './Placeholder.vue'
import ObjectCard from './ObjectCard.vue'

const props = defineProps<{
  post: Post
  postUrl?: RouteLocationRaw
}>()

const { t } = useTranslation()
const { formatRelativeIfRecentDate } = useFormatDate()

const postUrl = computed(() => props.postUrl || props.post.page || '#')

const formatDate = (dateString: string) => {
  return formatRelativeIfRecentDate(dateString, {
    dateStyle: 'long',
    timeStyle: 'short',
  })
}

const descriptionShort = computed(() => {
  const textToUse = props.post.headline || props.post.content
  if (!textToUse) return ''
  const cleaned = removeMarkdownSync(textToUse)
  return cleaned.length > 160 ? cleaned.substring(0, 160) + '...' : cleaned
})
</script>
