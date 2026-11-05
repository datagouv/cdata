<template>
  <ObjectCard
    :url="topicUrl || topic.page || '#'"
    :icon="RiBookShelfLine"
  >
    <template
      v-if="showLogo"
      #media
    >
      <OrganizationLogo
        v-if="topic.organization"
        :organization="topic.organization"
        size-class="size-12 p-1"
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
    <template #title>
      {{ topic.name }}
    </template>

    <ObjectCardOwner
      v-if="topic.organization || topic.owner"
      :show-logo="!showLogo"
      show-details
      :organization="topic.organization"
      :owner="topic.owner"
      :organization-url="organizationUrl"
    />
    <ObjectCardMeta v-if="topic.last_modified">
      <TranslationT
        tag="span"
        class="tabular-nums"
        keypath="Mis à jour {date}"
      >
        <template #date>
          <FormattedDate
            :date="topic.last_modified"
            format="relative"
            :options="{ dateStyle: 'medium' }"
          />
        </template>
      </TranslationT>
    </ObjectCardMeta>
    <ObjectCardMeta
      v-if="showStats && hasStats"
      class="max-[480px]:hidden"
    >
      <ObjectCardMetrics>
        <ObjectCardMetric
          v-if="topic.nb_datasets !== undefined"
          :icon="RiDatabase2Line"
          :value="topic.nb_datasets"
          :label="t('{n} jeux de données | {n} jeu de données | {n} jeux de données', topic.nb_datasets)"
        />
        <ObjectCardMetric
          v-if="topic.nb_dataservices !== undefined"
          :icon="RiTerminalLine"
          :value="topic.nb_dataservices"
          :label="t('{n} API', topic.nb_dataservices)"
        />
        <ObjectCardMetric
          v-if="topic.nb_reuses !== undefined"
          :icon="RiLineChartLine"
          :value="topic.nb_reuses"
          :label="t('{n} réutilisations | {n} réutilisation | {n} réutilisations', topic.nb_reuses)"
        />
      </ObjectCardMetrics>
    </ObjectCardMeta>
    <ObjectCardShortDescription
      :text="topic.description"
      class="max-md:hidden"
    />
    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RiBookShelfLine, RiDatabase2Line, RiLineChartLine, RiTerminalLine } from '@remixicon/vue'
import type { RouteLocationRaw } from 'vue-router'
import type { TopicV2 } from '../types/topics'
import { useTranslation } from '../composables/useTranslation'
import Avatar from './Avatar.vue'
import FormattedDate from './FormattedDate.vue'
import ObjectCard from './ObjectCard.vue'
import ObjectCardMeta from './ObjectCardMeta.vue'
import ObjectCardMetric from './ObjectCardMetric.vue'
import ObjectCardMetrics from './ObjectCardMetrics.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import OrganizationLogo from './OrganizationLogo.vue'
import Placeholder from './Placeholder.vue'
import TranslationT from './TranslationT.vue'

type TopicWithStats = TopicV2 & {
  nb_datasets?: number
  nb_dataservices?: number
  nb_reuses?: number
}

const props = withDefaults(
  defineProps<{
    topic: TopicWithStats
    topicUrl?: RouteLocationRaw
    organizationUrl?: RouteLocationRaw | null
    showLogo?: boolean
    showStats?: boolean
  }>(),
  {
    showLogo: true,
    showStats: true,
  },
)
const { t } = useTranslation()

const hasStats = computed(() => props.topic.nb_datasets !== undefined || props.topic.nb_dataservices !== undefined || props.topic.nb_reuses !== undefined)
</script>
