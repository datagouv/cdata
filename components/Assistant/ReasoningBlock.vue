<template>
  <CollapsibleTrace
    :icon="RiBrainLine"
    class="reasoning-block border-dashed"
  >
    <template #header>
      <span class="block truncate text-[11px] font-medium leading-4 text-new-gray-medium">{{ $t('Raisonnement') }}</span>
    </template>
    <ol
      class="m-0 text-[11px] leading-5 text-new-gray-dark"
      :class="sentences.length > 1 ? 'list-decimal pl-4' : 'list-none p-0'"
    >
      <li
        v-for="(sentence, index) in sentences"
        :key="index"
        class="break-words"
        :class="{ 'marker:content-none': sentences.length === 1 }"
      >
        {{ sentence }}
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
