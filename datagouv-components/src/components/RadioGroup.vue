<template>
  <fieldset class="flex flex-col gap-2">
    <legend
      v-if="legend"
      class="fr-label mb-2"
    >
      {{ legend }}
    </legend>
    <slot />
  </fieldset>
</template>

<script setup lang="ts">
import { provide, toRef } from 'vue'
import { radioGroupInjectionKey } from './radioGroupContext'

const props = defineProps<{
  modelValue: string
  name: string
  legend?: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

provide(radioGroupInjectionKey, {
  name: toRef(() => props.name),
  modelValue: toRef(() => props.modelValue),
  select: (value: string) => emit('update:modelValue', value),
})
</script>
