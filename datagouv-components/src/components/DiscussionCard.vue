<template>
  <div class="p-4 border bg-white border-gray-default relative hover:bg-gray-some fr-enlarge-link">
    <div class="flex flex-col">
      <h4 class="w-full text-base mb-0 flex items-center gap-1">
        <AppLink
          :to="discussionUrl || discussion.self_web_url || '#'"
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
              d="M14.6666 4.06871C15.0348 4.06871 15.3333 4.36718 15.3333 4.73537V12C15.3333 12.3682 15.0348 12.6667 14.6666 12.6667H11.2L9.33329 15L7.46663 12.6667H3.99996C3.63177 12.6667 3.33329 12.3682 3.33329 12V4.73537C3.33329 4.36718 3.63177 4.06871 3.99996 4.06871H14.6666ZM14 5.40204H4.66663V11.3334H8.10729L9.33329 12.8654L10.5593 11.3334H14V5.40204ZM12.6666 1.33337V2.66671H1.99996V10H0.666626V2.00004C0.666626 1.63185 0.965103 1.33337 1.33329 1.33337H12.6666Z"
              fill="#161616"
            />
          </svg>
          <span class="block truncate flex-1">{{ discussion.title }}</span>
          <span class="absolute inset-0" />
        </AppLink>
      </h4>

      <div class="flex items-center gap-2 text-sm">
        <img
          v-if="discussion.user"
          :src="avatarUrl"
          class="size-4 rounded-full"
          :alt="`${discussion.user.first_name} ${discussion.user.last_name}`"
        >
        <div class="flex flex-wrap items-center gap-1">
          <AppLink
            v-if="discussion.user"
            :to="userUrl"
            class="link text-sm relative z-[2] underline"
          >
            {{ discussion.user.first_name }} {{ discussion.user.last_name }}
          </AppLink>
          <span class="text-gray-medium">·</span>
          <span class="text-gray-medium whitespace-nowrap">
            {{ t('Posté {date}', { date: formatDate(discussion.created) }) }}
          </span>
        </div>
      </div>

      <p
        v-if="firstMessageContent"
        class="text-sm text-gray-medium line-clamp-2 m-0 mt-2"
      >
        {{ firstMessageContent }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useFormatDate } from '../functions/dates'
import { useTranslation } from '../composables/useTranslation'
import { useComponentsConfig } from '../config'
import AppLink from './AppLink.vue'

interface Discussion {
  id: string
  title: string
  user?: {
    id: string
    first_name: string
    last_name: string
    slug: string
  }
  created: string
  discussion?: Array<{
    content: string
  }>
  content?: string
  self_web_url?: string
}

const props = defineProps<{
  discussion: Discussion
  discussionUrl?: RouteLocationRaw
  userUrl?: RouteLocationRaw
}>()

const { t } = useTranslation()
const { formatRelativeIfRecentDate } = useFormatDate()
const config = useComponentsConfig()

const avatarUrl = computed(() => {
  if (props.discussion.user && props.discussion.user.id) {
    return `${config.apiBase}/api/1/avatars/${props.discussion.user.id}/80`
  }
  return ''
})

const userUrl = computed(() => {
  if (props.userUrl) return props.userUrl
  if (props.discussion.user && props.discussion.user.slug) {
    return `/users/${props.discussion.user.slug}`
  }
  return ''
})

const firstMessageContent = computed(() => {
  if (props.discussion.content && typeof props.discussion.content === 'string') {
    const text = props.discussion.content.trim()
    if (!text) return ''
    return text.length > 200 ? text.substring(0, 200) + '...' : text
  }

  if (props.discussion.discussion && Array.isArray(props.discussion.discussion) && props.discussion.discussion.length > 0) {
    const firstMessage = props.discussion.discussion[0]
    if (firstMessage && firstMessage.content) {
      const text = firstMessage.content.trim()
      if (!text) return ''
      return text.length > 200 ? text.substring(0, 200) + '...' : text
    }
  }

  return ''
})

const formatDate = (dateString: string) => {
  return formatRelativeIfRecentDate(dateString, {
    dateStyle: 'long',
    timeStyle: 'short',
  })
}
</script>
