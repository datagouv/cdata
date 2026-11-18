<template>
  <ObjectCardMeta>
    <span v-if="reuseType">{{ reuseType }}</span>
    <ObjectCardMetrics>
      <ObjectCardMetric
        :icon="RiEyeLine"
        :value="reuse.metrics.views"
        :label="t('{n} vues | {n} vue | {n} vues', reuse.metrics.views)"
      />
      <ObjectCardMetric
        :icon="RiStarLine"
        :value="reuse.metrics.followers"
        :label="t('{n} abonnés | {n} abonné | {n} abonnés', reuse.metrics.followers)"
      />
    </ObjectCardMetrics>
  </ObjectCardMeta>
</template>

<script setup lang="ts">
import { RiEyeLine, RiStarLine } from '@remixicon/vue'
import { useReuseType } from '../composables/useReuseType'
import type { Reuse, ReuseV2 } from '../types/reuses'
import { useTranslation } from '../composables/useTranslation'
import ObjectCardMeta from './ObjectCardMeta.vue'
import ObjectCardMetric from './ObjectCardMetric.vue'
import ObjectCardMetrics from './ObjectCardMetrics.vue'

const props = defineProps<{
  reuse: Reuse | ReuseV2
}>()

const { t } = useTranslation()

const { label: reuseType } = useReuseType(() => props.reuse.type)
</script>
