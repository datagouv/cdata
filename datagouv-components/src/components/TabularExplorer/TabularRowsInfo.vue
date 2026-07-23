<template>
  <span class="flex items-center gap-1.5 text-xs text-gray-plain">
    <RiLayoutRowLine
      class="size-3 text-mention-grey"
      aria-hidden="true"
    />
    <span class="font-bold hidden md:inline">{{ t('Lignes') }}</span>
    <span class="font-mono tabular-nums">{{ (tableData?.meta.total ?? 0).toLocaleString() }}/{{ totalLines.toLocaleString() }}</span>
  </span>
</template>

<script setup lang="ts">
import { RiLayoutRowLine } from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'
import { useTabularContext } from './useTabularContext'

const { t } = useTranslation()
const { tableData, totalLines } = useTabularContext()
</script>
