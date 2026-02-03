<template>
  <RadioGroup
    :model-value="modelValue ?? ''"
    :name="name"
    :legend="label"
    @update:model-value="emit('update:modelValue', $event === '' ? undefined : $event)"
  >
    <RadioInput value="">
      {{ allLabel }}
    </RadioInput>
    <RadioInput
      v-for="option in options"
      :key="option.value"
      :value="option.value"
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
import RadioGroup from '../../RadioGroup.vue'
import RadioInput from '../../RadioInput.vue'

export interface FilterOption {
  value: string
  label: string
  description?: string
}

withDefaults(defineProps<{
  modelValue: string | undefined
  options: FilterOption[]
  label: string
  name: string
  allLabel?: string
}>(), {
  allLabel: 'Tous',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()
</script>
