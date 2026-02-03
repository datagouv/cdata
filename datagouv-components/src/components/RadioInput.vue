<template>
  <label
    class="flex items-center gap-2 p-1 rounded cursor-pointer transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500"
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
    <component
      :is="icon"
      v-if="icon"
      class="w-4 h-4"
    />
    <span class="text-sm flex-1 min-w-0">
      <slot />
    </span>
    <span
      v-if="loading || count !== undefined"
      class="bg-gray-200 text-gray-600 text-xs font-bold px-1 py-0.5 rounded"
    >
      <BouncingDots v-if="loading" />
      <template v-else>{{ formattedCount }}</template>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, inject, type Component } from 'vue'
import { radioGroupInjectionKey } from './radioGroupContext'
import { useTranslation } from '../composables/useTranslation'
import BouncingDots from './BouncingDots.vue'

type Props = {
  value: string
  count?: number
  loading?: boolean
  icon?: Component
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
