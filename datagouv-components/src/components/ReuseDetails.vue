<template>
  <div class="flex flex-wrap items-center gap-0.5">
    <p class="text-sm mb-0">
      {{ reuseType }}
    </p>
    <RiSubtractLine
      aria-hidden="true"
      class="size-4 fill-gray-medium"
    />
    <p
      class="text-sm mb-0 flex items-center gap-0.5"
      :aria-label="t('{n} vues | {n} vue | {n} vues', reuse.metrics.views)"
    >
      <RiEyeLine
        aria-hidden="true"
        class="size-3.5"
      />{{ summarize(reuse.metrics.views) }}
    </p>
    <p
      class="text-sm mb-0 flex items-center gap-0.5"
      :aria-label="t('{n} abonnés | {n} abonné | {n} abonnés', reuse.metrics.followers)"
    >
      <RiStarLine
        aria-hidden="true"
        class="size-3.5"
      />{{ summarize(reuse.metrics.followers) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { RiEyeLine, RiStarLine, RiSubtractLine } from '@remixicon/vue'
import { useI18n } from 'vue-i18n'
import { useReuseType } from '../composables/useReuseType'
import { summarize } from '../functions/helpers'
import type { Reuse } from '../types/reuses'

const props = defineProps<{
  reuse: Reuse
}>()

const { t } = useI18n()

const { label: reuseType } = useReuseType(() => props.reuse.type)
</script>
