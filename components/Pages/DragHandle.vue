<template>
  <button
    type="button"
    class="inline-flex items-center justify-center size-6 rounded opacity-80 hover:opacity-100 hover:bg-white/10 cursor-grab active:cursor-grabbing"
    :data-drag-handle="group"
    :title="$t('Glisser pour déplacer (ou flèches du clavier)')"
    :aria-label="$t('Déplacer')"
    @keydown="emit('keyboardMove', $event)"
  >
    <RiDraggable class="size-4" />
  </button>
</template>

<script setup lang="ts">
import { RiDraggable } from '@remixicon/vue'

defineProps<{
  // Matches the `group` given to `useBlocSortable` by the list holding the item.
  group: string
}>()

const emit = defineEmits<{
  keyboardMove: [KeyboardEvent]
}>()
</script>
