<template>
  <ProgressBar
    :value="score"
    :max="quality_max_score"
    :aria-label="score >= high ? t('Bon') : t('À améliorer')"
    :bar-class="barClass"
    :compact
    :class="props.class"
  >
    <span class="sr-only">
      <template v-if="score >= high">{{ t('Bon') }}</template>
      <template v-else>{{ t('À améliorer') }}</template>
      ({{ calculatedScore }})
    </span>
  </ProgressBar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../composables/useTranslation'
import ProgressBar from './ProgressBar.vue'

const props = withDefaults(defineProps<{
  score: number
  class?: string
  compact?: boolean
}>(), {
  class: '',
})
const quality_max_score = 1
const high = quality_max_score * 2 / 3
const { t, locale } = useTranslation()
const calculatedScore = computed(() => new Intl.NumberFormat(locale, { style: 'percent' }).format(props.score))
const barClass = computed(() => {
  if (props.score >= high) return props.compact ? 'bg-new-success' : 'bg-success-dark'
  return props.compact ? 'bg-new-gray-medium-clic' : 'bg-gray-low'
})
</script>
