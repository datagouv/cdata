<template>
  <ObjectCard>
    <template
      v-if="showLogo"
      #media
    >
      <div class="flex justify-center items-center p-2 border border-gray-lower bg-[#fff] rounded-md overflow-hidden">
        <OrganizationLogo
          v-if="topic.organization"
          :organization="topic.organization"
          size-class="size-12"
        />
        <Avatar
          v-else-if="topic.owner"
          :user="topic.owner"
          :size="48"
        />
        <Placeholder
          v-else
          type="Dataset"
          class="size-12"
        />
      </div>
    </template>

    <h4 class="w-full text-base mb-0 flex items-center gap-1">
      <AppLink
        :to="computedTopicUrl"
        class="text-gray-title text-base bg-none flex items-center w-full truncate gap-1"
      >
        <RiBookShelfLine
          aria-hidden="true"
          class="size-4 flex-none"
        />
        <span class="block truncate flex-1">{{ topic.name }}</span>
        <span class="absolute inset-0" />
      </AppLink>
    </h4>

    <div
      v-if="topic.organization || topic.owner"
      class="text-sm m-0 flex flex-wrap md:flex-nowrap gap-y-1 items-center truncate"
    >
      <template v-if="topic.organization">
        <OrganizationNameWithCertificate
          :organization="topic.organization"
          class="flex-shrink-0 truncate"
        />
      </template>
      <span
        v-else-if="ownerName"
        class="flex-shrink-0 truncate"
      >
        {{ ownerName }}
      </span>
      <RiSubtractLine
        v-if="(topic.organization || topic.owner) && topic.last_modified"
        aria-hidden="true"
        class="hidden md:block size-4 flex-none fill-gray-medium"
      />
      <div
        v-if="topic.last_modified"
        class="w-full md:w-auto text-gray-medium whitespace-nowrap"
      >
        {{ t('Mis à jour {date}', { date: formatDate(topic.last_modified) }) }}
      </div>
    </div>

    <p
      v-if="descriptionShort"
      class="fr-text--sm fr-mb-0 overflow-wrap-anywhere hidden sm:block line-clamp-2 mt-1"
    >
      {{ descriptionShort }}
    </p>

    <div
      v-if="showStats && (topic.nb_datasets || topic.nb_dataservices || topic.nb_reuses)"
      class="flex items-center gap-4 mt-2 text-xs text-gray-medium"
    >
      <div
        v-if="topic.nb_datasets"
        class="flex items-center gap-1"
      >
        <RiDatabase2Line
          aria-hidden="true"
          class="size-4"
        />
        <span>{{ topic.nb_datasets }}</span>
      </div>

      <div
        v-if="topic.nb_dataservices"
        class="flex items-center gap-1"
      >
        <RiTerminalLine
          aria-hidden="true"
          class="size-4"
        />
        <span>{{ topic.nb_dataservices }}</span>
      </div>

      <div
        v-if="topic.nb_reuses"
        class="flex items-center gap-1"
      >
        <RiLineChartLine
          aria-hidden="true"
          class="size-4"
        />
        <span>{{ topic.nb_reuses }}</span>
      </div>
    </div>

    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { RiBookShelfLine, RiDatabase2Line, RiLineChartLine, RiSubtractLine, RiTerminalLine } from '@remixicon/vue'
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { TopicV2 } from '../types/topics'
import { useFormatDate } from '../functions/dates'
import { removeMarkdownSync } from '../functions/markdown'
import { getOwnerName } from '../functions/owned'
import { useTranslation } from '../composables/useTranslation'
import AppLink from './AppLink.vue'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'
import OrganizationLogo from './OrganizationLogo.vue'
import Avatar from './Avatar.vue'
import Placeholder from './Placeholder.vue'
import ObjectCard from './ObjectCard.vue'

type TopicWithStats = TopicV2 & {
  nb_datasets?: number
  nb_dataservices?: number
  nb_reuses?: number
}

const props = withDefaults(defineProps<{
  topic: TopicWithStats
  topicUrl?: RouteLocationRaw
  showLogo?: boolean
  showStats?: boolean
}>(), {
  showLogo: true,
  showStats: true,
})

const { t } = useTranslation()
const { formatRelativeIfRecentDate } = useFormatDate()

const computedTopicUrl = computed(() => props.topicUrl || props.topic.page || '#')

const formatDate = (dateString: string) => {
  return formatRelativeIfRecentDate(dateString, {
    dateStyle: 'long',
  })
}

const ownerName = computed(() => {
  if (!props.topic.owner) return ''
  return getOwnerName(props.topic)
})

const descriptionShort = computed(() => {
  if (!props.topic.description) return ''
  const cleaned = removeMarkdownSync(props.topic.description)
  return cleaned.length > 200 ? cleaned.substring(0, 200) + '...' : cleaned
})
</script>
