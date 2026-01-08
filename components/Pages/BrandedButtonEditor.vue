<template>
  <!-- Edit mode -->
  <div
    v-if="edit"
    class="space-y-2 relative"
    :class="className"
  >
    <button
      v-if="title || href"
      class="absolute -left-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      :title="$t('Supprimer')"
      @click="$emit('clear')"
    >
      <RiDeleteBinLine class="size-5" />
    </button>
    <BrandedButton
      :color
      class="pointer-events-none"
    >
      <input
        :value="title"
        type="text"
        class="bg-transparent border-none outline-none text-inherit font-inherit pointer-events-auto"
        :style="{ width: `${Math.max(10, title?.length || 0)}ch` }"
        :placeholder="$t('Titre du bouton')"
        @input="$emit('update:title', ($event.target as HTMLInputElement).value)"
      >
    </BrandedButton>
    <input
      :value="href"
      type="text"
      class="block text-sm text-gray-500 border rounded px-2 py-1 w-full max-w-xs"
      :placeholder="$t('URL du bouton')"
      @input="$emit('update:href', ($event.target as HTMLInputElement).value)"
    >
  </div>

  <!-- Display mode -->
  <BrandedButton
    v-else-if="title && href"
    :href="href!"
    :class="className"
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
  title?: string | null
  href?: string | null
  color?: ComponentProps<typeof BrandedButton>['color']
  class?: string
}>(), {
  color: 'primary',
  class: '',
})

defineEmits<{
  'update:title': [value: string]
  'update:href': [value: string]
  'clear': []
}>()

const className = computed(() => props.class)
</script>
