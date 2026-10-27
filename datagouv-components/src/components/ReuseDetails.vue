<template>
  <div class="dg-card-metadata-row dg-reuse-metadata">
    <span
      v-if="reuseType"
      class="dg-card-type"
    >{{ reuseType }}</span>
    <div
      class="dg-card-metrics dg-card-usage"
      :class="{ 'dg-card-usage-only': !reuseType }"
    >
      <p :aria-label="t('{n} vues | {n} vue | {n} vues', reuse.metrics.views)">
        <RiEyeLine
          class="dg-ds-icon"
          data-icon-size="compact"
          aria-hidden="true"
          focusable="false"
        />{{ summarize(reuse.metrics.views) }}
      </p>
      <p :aria-label="t('{n} abonnés | {n} abonné | {n} abonnés', reuse.metrics.followers)">
        <RiStarLine
          class="dg-ds-icon"
          data-icon-size="compact"
          aria-hidden="true"
          focusable="false"
        />{{ summarize(reuse.metrics.followers) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import '../../assets/cards.css'
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
