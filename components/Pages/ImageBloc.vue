<template>
  <div
    v-if="edit"
    class="space-y-2"
  >
    <img
      v-if="bloc.image"
      :src="bloc.image"
      :alt="bloc.alt ?? ''"
      class="w-full h-auto"
    >
    <!-- No image yet: the bloc is dropped on save (see `withoutEmptyBlocs`) -->
    <div
      v-else
      class="flex items-center justify-center aspect-video rounded border border-dashed border-gray-300 text-gray-400"
    >
      <RiImageLine class="size-8" />
    </div>
    <BlocImageInput
      :model-value="bloc.image || null"
      @update:model-value="bloc.image = $event ?? ''"
    />
    <input
      :value="bloc.alt ?? ''"
      type="text"
      class="block text-sm text-gray-title placeholder:text-gray-500 bg-white border rounded px-2 py-1 w-full"
      :placeholder="$t('Texte alternatif, vide pour une image décorative')"
      :aria-label="$t('Texte alternatif')"
      @change="bloc.alt = ($event.target as HTMLInputElement).value.trim() || null"
    >
  </div>
  <img
    v-else
    :src="bloc.image"
    :alt="bloc.alt ?? ''"
    class="w-full h-auto"
    loading="lazy"
  >
</template>

<script setup lang="ts">
import { RiImageLine } from '@remixicon/vue'
import BlocImageInput from './BlocImageInput.vue'
import type { ImageBloc } from '~/types/pages'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<ImageBloc>({ required: true })
</script>
