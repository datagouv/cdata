<template>
  <span class="flex items-center gap-1.5 text-xs text-gray-plain">
    <RiLoader5Line
      v-if="isRefreshing"
      class="size-3 text-new-primary animate-spin"
      aria-hidden="true"
    />
    <RiLayoutRowLine
      v-else
      class="size-3 text-mention-grey"
      aria-hidden="true"
    />
    <span class="font-bold hidden md:inline">{{ t('Lignes') }}</span>
    <!-- The count stays in place while refreshing: the spinner already says it is
         stale, and swapping it for a word of another width would shift the whole
         toolbar on every search. -->
    <span
      data-testid="row-count"
      class="font-mono tabular-nums"
    >{{ (tableData?.meta.total ?? 0).toLocaleString() }}/{{ totalLines.toLocaleString() }}</span>
  </span>
</template>

<script setup lang="ts">
import { RiLayoutRowLine, RiLoader5Line } from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'
import { useTabularContext } from './useTabularContext'

const { t } = useTranslation()
const { tableData, totalLines, isRefreshing } = useTabularContext()
</script>
