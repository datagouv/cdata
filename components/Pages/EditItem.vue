<template>
  <div
    :data-edit-item="edit ? (band ? 'band' : '') : undefined"
    class="relative"
  >
    <!-- Above the item, so that it never covers the item's own controls. The bottom padding
         bridges the gap down to the outline: the pointer stays on the item on its way up.
         A band has no room above it (that is the previous band, or the page header): its
         tab goes in its own top left corner, empty as its content sits in the container.
         A container's tab goes to the right: on the left, it would sit on its first child's. -->
    <div
      v-if="edit"
      data-edit-tab
      class="absolute z-30"
      :class="band ? 'top-2 left-2' : container ? 'bottom-full -right-1.5 pb-1.5' : 'bottom-full -left-1.5 pb-1.5'"
    >
      <div class="flex items-center gap-0.5 rounded-md bg-new-primary text-white text-xs shadow-sm p-0.5">
        <button
          v-if="draggable"
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
        <span class="px-1 select-none whitespace-nowrap">{{ label }}</span>
        <Menu
          as="div"
          class="relative"
        >
          <MenuButton
            class="inline-flex items-center justify-center size-6 rounded opacity-80 hover:opacity-100 hover:bg-white/10"
            :aria-label="$t('Actions sur {label}', { label })"
          >
            <RiMore2Fill class="size-4" />
          </MenuButton>
          <MenuItems class="absolute left-0 z-50 mt-1 w-48 rounded-md bg-white py-1 text-sm text-gray-plain shadow-lg ring-1 ring-black/5 focus:outline-hidden">
            <!-- `MenuItem`s specific to the item, e.g. the width of a bloc -->
            <slot name="actions" />
            <MenuItem v-slot="{ active }">
              <button
                type="button"
                class="flex w-full items-center gap-2 px-3 py-1.5"
                :class="{ 'bg-gray-100': active }"
                @click="emit('delete')"
              >
                <RiDeleteBinLine class="size-4" />
                {{ $t('Supprimer') }}
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { RiDeleteBinLine, RiDraggable, RiMore2Fill } from '@remixicon/vue'

defineProps<{
  // Without it, only the content is rendered: the page as visitors see it.
  edit: boolean
  label: string
  // Shows the drag handle, which starts a drag (see `startBlocsDrag`).
  draggable?: boolean
  // A full width band of the page (a section), framed from the inside.
  band?: boolean
  // An item holding other items (an accordion).
  container?: boolean
}>()

const emit = defineEmits<{
  delete: []
  dragStart: [PointerEvent]
  keyboardMove: [KeyboardEvent]
}>()
</script>

<style>
/* Only the innermost hovered (or focused) item shows its outline and its tab: the editor
   stays as quiet as the page, whatever the nesting.
   A tab shows at once, but hides after a grace delay, during which it stays usable: leaving
   the item by a few pixels on the way to its tab must not take the tab away.
   `allow-discrete` delays the switch of `pointer-events` too. Not `visibility`: a hidden
   button cannot take the keyboard focus, which is what shows the tab to keyboard users. */
[data-edit-tab] {
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms 400ms, pointer-events 0s 550ms;
  transition-behavior: allow-discrete;
}

[data-edit-item]:is(:hover, :focus-within):not(:has([data-edit-item]:is(:hover, :focus-within))) {
  outline: 2px solid var(--color-new-primary);
  outline-offset: 6px;
  border-radius: 2px;
}

/* Outside a band, the outline would sit on the edges of the screen and on its neighbours. */
[data-edit-item="band"]:is(:hover, :focus-within):not(:has([data-edit-item]:is(:hover, :focus-within))) {
  outline-offset: -2px;
  border-radius: 0;
}

[data-edit-item]:is(:hover, :focus-within):not(:has([data-edit-item]:is(:hover, :focus-within))) > [data-edit-tab] {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 100ms, pointer-events 0s;
}

/* No grace delay inside the active item: the lingering tab of an item inside it could sit
   where the pointer is heading, and catch the click meant for another. */
[data-edit-item]:is(:hover, :focus-within):not(:has([data-edit-item]:is(:hover, :focus-within))) [data-edit-item] > [data-edit-tab] {
  transition: opacity 100ms, pointer-events 0s;
}

/* While dragging, only the drop indicator shows: no tab, outline or "add" control popping
   up under the pointer on its way (see `startBlocsDrag`). */
:root[data-blocs-dragging] {
  cursor: grabbing;
  user-select: none;
}

:root[data-blocs-dragging] [data-edit-tab],
:root[data-blocs-dragging] [data-edit-control] {
  visibility: hidden;
}

:root[data-blocs-dragging] [data-edit-item] {
  outline: none !important;
}

[data-drag-source] {
  opacity: 0.4;
}
</style>
