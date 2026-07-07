<template>
  <span
    v-if="value == null || value === ''"
    class="font-[Inconsolata,monospace] text-gray-low italic"
    :class="compact ? 'text-xs' : 'text-sm'"
  >null</span>
  <span
    v-else-if="columnType === 'boolean'"
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs"
    :class="isTruthy(value) ? 'bg-new-success-light text-new-success' : 'bg-new-warning-light text-new-error'"
  >
    <span
      class="size-2 rounded-full"
      :class="isTruthy(value) ? 'bg-new-success' : 'bg-new-error'"
    />
    {{ isTruthy(value) ? t('Vrai') : t('Faux') }}
  </span>
  <span
    v-else-if="columnType === 'categorical'"
    class="inline-block max-w-full truncate rounded bg-gray-lower px-2 py-0.5 text-xs text-gray-plain"
  >{{ value }}</span>
  <span
    v-else-if="columnType === 'number'"
    :class="compact ? 'font-mono tabular-nums text-xs text-gray-title' : ''"
  >{{ formatNumber(value) }}</span>
  <span
    v-else-if="columnType === 'date'"
    :class="compact ? 'font-mono tabular-nums text-xs text-gray-title' : ''"
  >{{ formatCellDate(value) }}</span>
  <span
    v-else
    class="text-gray-title truncate block text-xs"
  >{{ typeof value === 'object' ? JSON.stringify(value) : value }}</span>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/useTranslation'
import { useFormatTabular, isTruthy } from '../../functions/tabular'
import type { ColumnType } from './types'

defineProps<{
  value: unknown
  columnType: ColumnType
  compact?: boolean
}>()

const { t } = useTranslation()
const { formatNumber, formatCellDate } = useFormatTabular()
</script>
