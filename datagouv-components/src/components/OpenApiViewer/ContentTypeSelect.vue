<template>
  <Tooltip v-if="contentTypes.length > 1">
    <div class="relative shrink-0">
      <select
        :value="modelValue"
        class="appearance-none text-xs font-mono bg-white border border-gray-default rounded pl-2 pr-6 py-1 text-gray-medium cursor-pointer hover:border-gray-400 transition-colors"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option
          v-for="ct in contentTypes"
          :key="ct"
          :value="ct"
        >
          {{ contentTypeLabel(ct) }}
        </option>
      </select>
      <RiArrowDownSLine class="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 size-3.5 text-gray-medium" />
    </div>
    <template #tooltip>
      {{ modelValue }}
    </template>
  </Tooltip>
  <Tooltip v-else-if="contentTypes.length === 1">
    <span
      class="text-xs font-mono bg-white border border-gray-default rounded px-2 py-1 text-gray-medium shrink-0"
    >
      {{ contentTypeLabel(contentTypes[0]!) }}
    </span>
    <template #tooltip>
      {{ contentTypes[0] }}
    </template>
  </Tooltip>
</template>

<script setup lang="ts">
import { RiArrowDownSLine } from '@remixicon/vue'
import Tooltip from '../Tooltip.vue'
import { contentTypeLabel } from './openapi'

defineProps<{
  contentTypes: string[]
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
