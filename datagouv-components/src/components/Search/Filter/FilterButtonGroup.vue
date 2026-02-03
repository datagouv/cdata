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
    >
      {{ option.label }}
      <span
        v-if="option.description"
        class="text-gray-400"
      >
        {{ option.description }}
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
}>(), {
  allLabel: 'Tous',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

function getCount(value: string): number | undefined {
  if (!props.facets) return undefined
  const facet = props.facets.find(f => f.name === value)
  return facet?.count
}

const totalCount = computed(() => getCount('all'))
</script>
