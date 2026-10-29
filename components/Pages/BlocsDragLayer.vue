<template>
  <Teleport to="body">
    <template v-if="blocsDrag">
      <div
        v-if="blocsDrag.target"
        class="fixed z-50 rounded-full pointer-events-none"
        :style="{
          background: accentOf(blocsDrag.target.list),
          left: `${blocsDrag.target.line.left}px`,
          top: `${blocsDrag.target.line.top}px`,
          width: `${blocsDrag.target.line.width}px`,
          height: `${blocsDrag.target.line.height}px`,
        }"
        data-testid="drop-indicator"
      />
      <div
        class="fixed z-50 rounded-md bg-new-primary text-white text-xs shadow-md px-2 py-1 pointer-events-none whitespace-nowrap"
        :style="{ left: `${blocsDrag.x + 12}px`, top: `${blocsDrag.y + 12}px` }"
      >
        {{ blocsDrag.source.label }}
      </div>
    </template>
  </Teleport>
</template>

<script setup lang="ts">
import { blocsDrag } from '~/composables/useBlocsDrag'

// Drawn above the page, the indicator does not inherit the colour of the editor's controls
// from the section it points into (white on a coloured one, see `EditItem`): read there.
function accentOf(list: HTMLElement): string {
  return getComputedStyle(list).getPropertyValue('--edit-accent')
}
</script>
