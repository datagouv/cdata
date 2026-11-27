<template>
  <CollapsibleTrace
    :icon="RiBrainLine"
    class="reasoning-block"
  >
    <template #header>
      <span class="block truncate">{{ $t('Raisonnement') }}</span>
    </template>
    <ol class="m-0 list-none space-y-1.5 p-0 pb-1 text-[11px] leading-5 text-new-gray-dark">
      <li
        v-for="(sentence, index) in sentences"
        :key="index"
        class="break-words marker:content-none"
        :class="{ 'grid grid-cols-[1rem_minmax(0,1fr)] gap-1.5': sentences.length > 1 }"
      >
        <!-- Lighter than the sentence but no lighter than #666: a paler grey fails the 4.5:1 contrast at 11px. -->
        <span
          v-if="sentences.length > 1"
          class="tabular-nums text-gray-medium"
          aria-hidden="true"
        >{{ index + 1 }}.</span>
        <span>{{ sentence }}</span>
      </li>
    </ol>
  </CollapsibleTrace>
</template>

<script setup lang="ts">
import { RiBrainLine } from '@remixicon/vue'
import CollapsibleTrace from './CollapsibleTrace.vue'

defineProps<{
  sentences: string[]
}>()
</script>
