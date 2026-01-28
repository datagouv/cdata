<template>
  <ObjectCard>
    <ObjectCardHeader
      :icon="RiChat3Line"
      :url="discussionUrl"
    >
      {{ discussion.title }}
    </ObjectCardHeader>

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
          :to="computedUserUrl"
          class="link text-sm relative z-[2] underline"
        >
          {{ discussion.user.first_name }} {{ discussion.user.last_name }}
        </AppLink>
        <RiSubtractLine
          aria-hidden="true"
          class="size-4 flex-none fill-gray-medium"
        />
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

    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { RiChat3Line, RiSubtractLine } from '@remixicon/vue'
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useFormatDate } from '../functions/dates'
import { useTranslation } from '../composables/useTranslation'
import { useComponentsConfig } from '../config'
import AppLink from './AppLink.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardHeader from './ObjectCardHeader.vue'

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

const discussionUrl = computed(() => props.discussionUrl || props.discussion.self_web_url || '#')

const avatarUrl = computed(() => {
  if (props.discussion.user?.id) {
    return `${config.apiBase}/api/1/avatars/${props.discussion.user.id}/80`
  }
  return ''
})

const computedUserUrl = computed(() => {
  if (props.userUrl) return props.userUrl
  if (props.discussion.user?.slug) {
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

  if (Array.isArray(props.discussion.discussion) && props.discussion.discussion.length > 0) {
    const firstMessage = props.discussion.discussion[0]
    if (firstMessage?.content) {
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
