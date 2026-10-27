<template>
  <ObjectCard>
    <template v-if="showLogo" #media>
      <OrganizationLogo
        v-if="topic.organization"
        :organization="topic.organization"
        size-class="size-12"
      />
      <Avatar v-else-if="topic.owner" :user="topic.owner" :size="48" />
      <Placeholder v-else type="Topic" class="size-12" />
    </template>

    <ObjectCardHeader :icon="RiBookShelfLine" :url="topicUrl || topic.page || '#'">
      {{ topic.name }}
    </ObjectCardHeader>

    <div
      v-if="topic.organization || topic.owner"
      class="text-sm flex flex-wrap gap-y-1 items-center"
    >
      <ObjectCardOwner
        :organization="topic.organization"
        :owner="topic.owner"
        :organization-url="organizationUrl"
      />
    </div>
    <TranslationT
      v-if="topic.last_modified"
      tag="div"
      class="card-date"
      keypath="Mis à jour {date}"
    >
      <template #date
        ><FormattedDate
          :date="topic.last_modified"
          format="relative"
          :options="{ dateStyle: 'medium' }"
      /></template>
    </TranslationT>
    <div v-if="showStats && metrics.length" class="card-metrics">
      <span
        v-for="metric in metrics"
        :key="metric.label"
        class="card-metric"
        :aria-label="`${metric.value} ${metric.label}`"
      >
        <component :is="metric.icon" aria-hidden="true" />{{ summarize(metric.value) }}
      </span>
    </div>
    <ObjectCardShortDescription :text="topic.description" />

    <slot />
  </ObjectCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RiBookShelfLine, RiDatabase2Line, RiLineChartLine, RiTerminalLine } from '@remixicon/vue'
import type { RouteLocationRaw } from 'vue-router'
import type { TopicV2 } from '../types/topics'
import ObjectCardHeader from './ObjectCardHeader.vue'
import ObjectCardOwner from './ObjectCardOwner.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import OrganizationLogo from './OrganizationLogo.vue'
import Avatar from './Avatar.vue'
import Placeholder from './Placeholder.vue'
import ObjectCard from './ObjectCard.vue'
import FormattedDate from './FormattedDate.vue'
import TranslationT from './TranslationT.vue'
import { summarize } from '../functions/helpers'
import { useTranslation } from '../composables/useTranslation'

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
const metrics = computed(() =>
  [
    { label: t('Jeux de données'), icon: RiDatabase2Line, value: props.topic.nb_datasets },
    { label: t('API'), icon: RiTerminalLine, value: props.topic.nb_dataservices },
    { label: t('Réutilisations'), icon: RiLineChartLine, value: props.topic.nb_reuses },
  ].filter(
    (metric): metric is typeof metric & { value: number } =>
      typeof metric.value === 'number' && Number.isFinite(metric.value),
  ),
)
</script>

<style scoped>
.card-date {
  color: #555;
  font-size: 0.875rem;
  line-height: 1.5rem;
  font-variant-numeric: tabular-nums;
}
.card-metrics {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: #555;
  font-variant-numeric: tabular-nums;
}
.card-metric {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  font-size: 0.75rem;
  line-height: 1.125rem;
}
.card-metric svg {
  width: 0.875rem;
  height: 0.875rem;
}
</style>
