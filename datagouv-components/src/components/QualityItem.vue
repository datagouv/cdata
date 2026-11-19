<template>
  <li class="p-0 m-0">
    <p class="flex items-start gap-2 m-0 text-sm/[22px] text-gray-title">
      <component
        :is="passed ? RiCheckLine : RiAlertLine"
        class="size-4 mt-[3px] flex-none"
        :class="passed ? 'text-new-success' : 'text-new-warning'"
        aria-hidden="true"
      />
      <span class="min-w-0 [overflow-wrap:anywhere]">{{ passed ? messagePassed : messageFailed }}</span>
    </p>
  </li>
</template>

<script setup lang="ts">
import { RiAlertLine, RiCheckLine } from '@remixicon/vue'

defineProps<{
  passed?: boolean | null
  messagePassed: string
  messageFailed: string
}>()
</script>
