<template>
  <div class="organization-metrics">
    <span
      v-for="item in items"
      :key="item.key"
      class="organization-metrics__item"
      :aria-label="`${item.value} ${item.label}`"
    >
      <component :is="item.icon" aria-hidden="true" />
      {{ summarize(item.value) }}
      <span v-if="showLabels">{{ item.label }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RiDatabase2Line, RiLineChartLine, RiStarLine, RiTerminalLine } from '@remixicon/vue'
import { summarize } from '../functions/helpers'
import { useTranslation } from '../composables/useTranslation'

const props = defineProps<{
  metrics: { datasets: number; dataservices: number; reuses: number; followers?: number }
  showFollowers?: boolean
  showLabels?: boolean
}>()

const { t } = useTranslation()
const items = computed(() => [
  {
    key: 'datasets',
    icon: RiDatabase2Line,
    value: props.metrics.datasets,
    label: t('Jeux de données'),
  },
  { key: 'dataservices', icon: RiTerminalLine, value: props.metrics.dataservices, label: t('API') },
  { key: 'reuses', icon: RiLineChartLine, value: props.metrics.reuses, label: t('Réutilisations') },
  ...(props.showFollowers && typeof props.metrics.followers === 'number'
    ? [{ key: 'followers', icon: RiStarLine, value: props.metrics.followers, label: t('Abonnés') }]
    : []),
])
</script>

<style scoped>
.organization-metrics {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  color: #555;
  font-variant-numeric: tabular-nums;
}
.organization-metrics__item {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  font-size: 0.75rem;
  line-height: 1.125rem;
}
.organization-metrics__item svg {
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
}
</style>
