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

    <ObjectCardHeader
      :icon="RiArticleLine"
      :url="postUrl"
    >
      {{ post.name }}
    </ObjectCardHeader>

    <ObjectCardShortDescription :text="post.headline || post.content" />

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
import { useFormatDate } from '../functions/dates'
import { useTranslation } from '../composables/useTranslation'
import type { Post } from '../types/posts'
import Placeholder from './Placeholder.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardHeader from './ObjectCardHeader.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'

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
</script>
