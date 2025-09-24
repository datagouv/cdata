<template>
  <meter
    class="quality-score"
    :class="props.class"
    min="0"
    low="0"
    :high="high"
    :max="quality_max_score"
    :optimum="quality_max_score"
    :value="score"
  >
    <template v-if="score >= high">
      {{ t('Bon') }}
    </template>
    <template v-else>
      {{ t('À améliorer') }}
    </template>({{ calculatedScore }})
  </meter>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  score: number
  class?: string
}>(), {
  class: '',
})
const quality_max_score = 1
const high = quality_max_score * 2 / 3
const { t, locale } = useI18n()
const calculatedScore = computed(() => new Intl.NumberFormat(locale.value, { style: 'percent' }).format(props.score))
</script>
