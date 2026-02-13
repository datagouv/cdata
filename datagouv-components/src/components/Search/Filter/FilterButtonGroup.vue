<template>
  <RadioGroup
    :model-value="modelValue ?? ''"
    :name="name"
    :legend="label"
    @update:model-value="emit('update:modelValue', $event === '' ? undefined : $event)"
  >
    <RadioInput
      value=""
      :count="totalCount"
      :loading="loading"
    >
      {{ allLabel }}
    </RadioInput>
    <RadioInput
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :count="getCount(option.value)"
      :loading="loading"
      :highlighted="props.highlightActive && !!props.modelValue"
    >
      <span class="flex items-center gap-1 min-w-0 overflow-hidden">
        <span
          class="shrink min-w-0 truncate"
          :title="option.description ? `${option.label} (${option.description})` : option.label"
        >{{ option.label }}</span>
        <span
          v-if="option.description"
          class="flex-1 basis-0 min-w-0 text-gray-400 text-xs truncate"
          :title="option.description"
        >
          {{ option.description }}
        </span>
      </span>
    </RadioInput>
  </RadioGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FacetItem } from '../../../types/search'
import RadioGroup from '../../RadioGroup.vue'
import RadioInput from '../../RadioInput.vue'

export interface FilterOption {
  value: string
  label: string
  description?: string
}

const props = withDefaults(defineProps<{
  modelValue: string | undefined
  options: FilterOption[]
  label: string
  name: string
  allLabel?: string
  facets?: FacetItem[]
  loading?: boolean
  highlightActive?: boolean
}>(), {
  allLabel: 'Tous',
  loading: false,
  highlightActive: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

function getCount(value: string): number | undefined {
  if (!props.facets) return undefined
  const facet = props.facets.find(f => f.name === value)
  return facet?.count ?? 0
}

const totalCount = computed(() => getCount('all'))
</script>
