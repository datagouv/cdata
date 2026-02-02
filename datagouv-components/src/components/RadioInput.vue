<template>
  <label
    class="flex items-center gap-2 p-1 rounded cursor-pointer transition"
    :class="isSelected ? 'bg-gray-200' : 'hover:bg-gray-100'"
  >
    <input
      type="radio"
      :name="group?.name.value"
      :value="value"
      :checked="isSelected"
      class="sr-only"
      @change="group?.select(value)"
    >
    <span
      v-if="$slots.icon"
      class="w-4 h-4 flex items-center justify-center"
    >
      <slot name="icon" />
    </span>
    <span class="text-sm flex-1">
      <slot />
    </span>
    <span
      v-if="count !== undefined"
      class="bg-gray-200 text-gray-600 text-xs font-bold px-1 py-0.5 rounded"
    >
      {{ formattedCount }}
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { radioGroupInjectionKey } from './radioGroupContext'
import { useTranslation } from '../composables/useTranslation'

type Props = {
  value: string
  count?: number
}

const props = defineProps<Props>()

const group = inject(radioGroupInjectionKey)
const { locale } = useTranslation()

const isSelected = computed(() => group?.modelValue.value === props.value)

const formattedCount = computed(() => {
  if (props.count === undefined) return ''
  return new Intl.NumberFormat(locale, { notation: 'compact' }).format(props.count)
})
</script>
