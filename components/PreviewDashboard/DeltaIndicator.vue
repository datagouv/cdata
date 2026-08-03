<template>
  <span
    v-if="value != null"
    class="inline-flex items-center gap-1 text-xs font-medium"
    :class="colorClass"
  >
    <component
      :is="direction === 'up' ? RiArrowUpLine : RiArrowDownLine"
      v-if="direction !== 'neutral'"
      class="size-3"
      aria-hidden="true"
    />
    {{ formatDelta(value, unit) }}
    <span class="sr-only"> ({{ directionLabel }})</span>
  </span>
</template>

<script setup lang="ts">
import { RiArrowDownLine, RiArrowUpLine } from '@remixicon/vue'
import { formatDelta, getDeltaDirection } from '~/utils/previewDashboard'

const props = defineProps<{
  value?: number
  unit: 'count' | 'points'
}>()

const { t } = useTranslation()

const direction = computed(() => getDeltaDirection(props.value ?? 0))

const colorClass = computed(() => {
  if (direction.value === 'up') return 'text-new-success'
  if (direction.value === 'down') return 'text-new-error'
  return 'text-gray-plain'
})

const directionLabel = computed(() => {
  if (direction.value === 'up') return t('en hausse')
  if (direction.value === 'down') return t('en baisse')
  return t('stable')
})
</script>
