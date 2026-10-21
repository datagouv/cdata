<template>
  <button
    type="button"
    class="inline-flex items-center justify-center size-6 rounded opacity-80 hover:opacity-100 hover:bg-white/10 cursor-grab active:cursor-grabbing touch-none"
    data-drag-handle
    :title="$t('Glisser pour déplacer (ou flèches du clavier)')"
    :aria-label="$t('Déplacer')"
    @pointerdown="emit('dragStart', $event)"
    @keydown="emit('keyboardMove', $event)"
  >
    <RiDraggable class="size-4" />
  </button>
</template>

<script setup lang="ts">
import { RiDraggable } from '@remixicon/vue'

const emit = defineEmits<{
  dragStart: [PointerEvent]
  keyboardMove: [KeyboardEvent]
}>()
</script>
