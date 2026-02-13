<template>
  <ObjectCard>
    <ObjectCardHeader
      :icon="RiChat3Line"
      :url="discussionUrl || discussion.self_web_url || '#'"
    >
      {{ discussion.title }}
    </ObjectCardHeader>

    <div
      v-if="discussion.organization || discussion.user"
      class="text-sm m-0 flex flex-wrap md:flex-nowrap gap-y-1 items-center truncate"
    >
      <ObjectCardOwner
        :organization="discussion.organization"
        :owner="discussion.user"
        :organization-url="organizationUrl"
      />
      <RiSubtractLine
        aria-hidden="true"
        class="size-4 flex-none fill-gray-medium"
      />
      <span class="text-gray-medium whitespace-nowrap">
        {{ t('Posté {date}', { date: formatDate(discussion.created) }) }}
      </span>
    </div>

    <ObjectCardShortDescription :text="firstMessageContent" />

    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { RiChat3Line, RiSubtractLine } from '@remixicon/vue'
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useFormatDate } from '../functions/dates'
import { useTranslation } from '../composables/useTranslation'
import type { Thread } from '../types/discussions'
import ObjectCard from './ObjectCard.vue'
import ObjectCardHeader from './ObjectCardHeader.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'

const props = defineProps<{
  discussion: Thread
  discussionUrl?: RouteLocationRaw
  organizationUrl?: RouteLocationRaw
}>()

const { t } = useTranslation()
const { formatRelativeIfRecentDate } = useFormatDate()

const firstMessageContent = computed(() => props.discussion.discussion?.[0]?.content)

const formatDate = (dateString: string) => {
  return formatRelativeIfRecentDate(dateString, {
    dateStyle: 'long',
    timeStyle: 'short',
  })
}
</script>
