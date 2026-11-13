<template>
  <CollapsibleTrace
    :icon="RiBrainLine"
    class="thinking-block border-dashed"
  >
    <template #header>
      <span class="block truncate text-[11px] font-medium leading-4 text-new-gray-medium">{{ $t('Raisonnement') }}</span>
    </template>
    <p class="m-0 whitespace-pre-wrap text-[11px] leading-4 text-new-gray-dark">
      {{ text }}
    </p>
  </CollapsibleTrace>
</template>

<script setup lang="ts">
import { RiBrainLine } from '@remixicon/vue'
import CollapsibleTrace from './CollapsibleTrace.vue'

defineProps<{
  text: string
}>()
</script>
