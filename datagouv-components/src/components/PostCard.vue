<template>
  <!-- Search mode - horizontal layout -->
  <article
    v-if="search"
    class="p-4 bg-white hover:bg-gray-some border border-gray-default fr-enlarge-link relative"
  >
    <div class="flex flex-wrap md:flex-nowrap gap-4 items-start">
      <div
        v-if="post.image || search"
        class="flex-none"
      >
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
      </div>
      <div class="flex-1 overflow-hidden">
        <h4 class="w-full text-base mb-0 flex">
          <AppLink
            :to="postUrl || '#'"
            class="text-gray-title text-base bg-none flex items-center w-full truncate gap-1"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="flex-none"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M13.3333 1.33331C13.7015 1.33331 14 1.63179 14 1.99998V14C14 14.3682 13.7015 14.6666 13.3333 14.6666H2.66667C2.29848 14.6666 2 14.3682 2 14V1.99998C2 1.63179 2.29848 1.33331 2.66667 1.33331H13.3333ZM12.6667 2.66665H3.33333V13.3333H12.6667V2.66665ZM11.3333 10.6666V12H4.66667V10.6666H11.3333ZM11.3333 7.99998V9.33331H4.66667V7.99998H11.3333ZM7.33333 3.99998V6.66665H4.66667V3.99998H7.33333ZM11.3333 4.66665V5.99998H8.66667V4.66665H11.3333Z"
                fill="#161616"
              />
            </svg>
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
          {{ t('Publié {date}', { date: formatDate(post.published || post.created_at) }) }}
        </div>
      </div>
    </div>
  </article>

  <!-- Default mode - vertical layout -->
  <article
    v-else
    class="p-4 border bg-white border-gray-default hover:bg-gray-some"
  >
    <AppLink
      :to="postUrl || '#'"
      class="post-link fr-raw-link"
    >
      <h4 class="text-base font-bold text-gray-900 mb-2 hover:text-blue-600 no-underline">
        {{ post.name }}
      </h4>
      <p
        v-if="post.headline || post.content"
        class="text-sm text-gray-600 line-clamp-2 no-underline"
      >
        {{ post.headline || post.content }}
      </p>
    </AppLink>
  </article>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { removeMarkdown } from '../functions/markdown'
import { useFormatDate } from '../functions/dates'
import { useTranslation } from '../composables/useTranslation'
import AppLink from './AppLink.vue'
import Placeholder from './Placeholder.vue'

type Post = {
  id: string
  name: string
  headline?: string
  content?: string
  image?: string | null
  published?: string
  created_at?: string
}

const props = withDefaults(defineProps<{
  post: Post
  postUrl?: RouteLocationRaw
  search?: boolean
}>(), {
  search: false,
})

const { t } = useTranslation()
const { formatRelativeIfRecentDate } = useFormatDate()

const formatDate = (dateString: string) => {
  return formatRelativeIfRecentDate(dateString, {
    dateStyle: 'long',
    timeStyle: 'short',
  })
}

const descriptionShort = ref('')
watchEffect(async () => {
  if (props.search) {
    const textToUse = props.post.headline || props.post.content
    if (textToUse) {
      const cleaned = await removeMarkdown(textToUse)
      // Limit to ~160 characters
      descriptionShort.value = cleaned.length > 160 ? cleaned.substring(0, 160) + '...' : cleaned
    }
  }
})
</script>

<style scoped>
.post-link {
  display: block;
  text-decoration: none !important;
}

.post-link:hover,
.post-link:focus,
.post-link:active,
.post-link:visited {
  text-decoration: none !important;
}

.post-link * {
  text-decoration: none !important;
}
</style>
