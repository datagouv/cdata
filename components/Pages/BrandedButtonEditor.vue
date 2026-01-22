<template>
  <!-- Edit mode -->
  <div
    v-if="edit"
    class="space-y-2 relative"
    :class="$props.class"
  >
    <button
      v-if="title || href"
      type="button"
      class="absolute -left-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      :title="$t('Supprimer')"
      @click="$emit('clear')"
    >
      <RiDeleteBinLine class="size-5" />
    </button>
    <div
      class="inline-flex items-center justify-center font-marianne font-medium border text-sm h-10 leading-none px-4 gap-x-1"
      :class="buttonColors"
    >
      <span
        contenteditable="true"
        role="textbox"
        class="outline-none min-w-[10ch] focus:ring-2 focus:ring-blue-300 rounded-sm"
        :aria-label="$t('Titre du bouton')"
        @blur="title = ($event.target as HTMLElement).textContent || ''"
      >{{ title || $t('Titre du bouton') }}</span>
    </div>
    <input
      v-model="href"
      type="text"
      class="block text-sm text-gray-500 border rounded px-2 py-1 w-full max-w-xs"
      :placeholder="$t('URL du bouton')"
      :aria-label="$t('URL du bouton')"
    >
  </div>

  <!-- Display mode -->
  <BrandedButton
    v-else-if="title && href"
    :href="href!"
    :class="$props.class"
    :color
  >
    {{ title }}
  </BrandedButton>
</template>

<script setup lang="ts">
import type { ComponentProps } from 'vue-component-type-helpers'
import { BrandedButton } from '@datagouv/components-next'
import { RiDeleteBinLine } from '@remixicon/vue'

const props = withDefaults(defineProps<{
  edit: boolean
  color?: ComponentProps<typeof BrandedButton>['color']
  class?: string
}>(), {
  color: 'primary',
  class: '',
})

const title = defineModel<string | null>('title')
const href = defineModel<string | null>('href')

defineEmits<{
  clear: []
}>()

const buttonColors = computed(() => {
  const colors: Record<string, string> = {
    'primary': 'text-white bg-new-primary !border-new-primary',
    'secondary': 'text-new-gray-dark bg-white !border-new-gray-dark',
    'tertiary': 'text-gray-plain !border-transparent',
    'warning': 'text-new-warning bg-white !border-new-warning',
    'danger': '!text-new-error bg-white !border-new-error',
    'brown-illustration': '!border-none bg-new-brown-illustration text-white',
    'green-illustration': '!border-none bg-new-green-illustration text-white',
  }
  return colors[props.color] || colors.primary
})
</script>
