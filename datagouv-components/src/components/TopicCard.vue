<template>
  <ObjectCard>
    <template
      v-if="showLogo"
      #media
    >
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
        type="Topic"
        class="size-12"
      />
    </template>

    <ObjectCardHeader
      :icon="RiBookShelfLine"
      :url="topicUrl || topic.page || '#'"
    >
      {{ topic.name }}
    </ObjectCardHeader>

    <div
      v-if="topic.organization || topic.owner"
      class="text-sm m-0 flex flex-wrap md:flex-nowrap gap-y-1 items-center truncate"
    >
      <ObjectCardOwner
        :organization="topic.organization"
        :owner="topic.owner"
      />
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

    <ObjectCardShortDescription :text="topic.description" />

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
import type { RouteLocationRaw } from 'vue-router'
import type { TopicV2 } from '../types/topics'
import { useFormatDate } from '../functions/dates'
import { useTranslation } from '../composables/useTranslation'
import ObjectCardHeader from './ObjectCardHeader.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import OrganizationLogo from './OrganizationLogo.vue'
import Avatar from './Avatar.vue'
import Placeholder from './Placeholder.vue'
import ObjectCard from './ObjectCard.vue'

type TopicWithStats = TopicV2 & {
  nb_datasets?: number
  nb_dataservices?: number
  nb_reuses?: number
}

withDefaults(defineProps<{
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

const formatDate = (dateString: string) => {
  return formatRelativeIfRecentDate(dateString, {
    dateStyle: 'long',
  })
}
</script>
