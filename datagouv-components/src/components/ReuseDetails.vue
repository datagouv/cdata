<template>
  <div class="reuse-details">
    <p v-if="reuseType" class="reuse-details__type">
      {{ reuseType }}
    </p>
    <div class="reuse-details__metrics" :class="{ 'reuse-details__metrics--only': !reuseType }">
      <p :aria-label="t('{n} vues | {n} vue | {n} vues', reuse.metrics.views)">
        <RiEyeLine aria-hidden="true" />{{ summarize(reuse.metrics.views) }}
      </p>
      <p :aria-label="t('{n} abonnés | {n} abonné | {n} abonnés', reuse.metrics.followers)">
        <RiStarLine aria-hidden="true" />{{ summarize(reuse.metrics.followers) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RiEyeLine, RiStarLine } from '@remixicon/vue'
import { useReuseType } from '../composables/useReuseType'
import { summarize } from '../functions/helpers'
import type { Reuse, ReuseV2 } from '../types/reuses'
import { useTranslation } from '../composables/useTranslation'

const props = defineProps<{
  reuse: Reuse | ReuseV2
}>()

const { t } = useTranslation()

const { label: reuseType } = useReuseType(() => props.reuse.type)
</script>

<style scoped>
.reuse-details {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  color: #555;
}
.reuse-details__type {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5rem;
}
.reuse-details__metrics {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-inline-start: 0.75rem;
  border-inline-start: 1px solid #e5e5e5;
  font-variant-numeric: tabular-nums;
}
.reuse-details__metrics--only {
  padding-inline-start: 0;
  border-inline-start: 0;
}
.reuse-details__metrics p {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.125rem;
}
.reuse-details__metrics svg {
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
}
</style>
