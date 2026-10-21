<template>
  <div
    :data-edit-item="edit ? '' : undefined"
    class="relative"
  >
    <!-- Above the item, so that it never covers the item's own controls. The bottom padding
         bridges the gap down to the outline: the pointer stays on the item on its way up. -->
    <div
      v-if="edit"
      data-edit-tab
      class="absolute bottom-full -left-1.5 z-30 pb-1.5"
    >
      <div class="flex items-center gap-0.5 rounded-md bg-new-primary text-white text-xs shadow-sm p-0.5">
        <DragHandle
          v-if="group"
          :group
          @keyboard-move="emit('keyboardMove', $event)"
        />
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
            <!-- `MenuItem`s specific to the item, e.g. the width of a grid cell -->
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
import { RiDeleteBinLine, RiMore2Fill } from '@remixicon/vue'
import DragHandle from './DragHandle.vue'

defineProps<{
  // Without it, only the content is rendered: the page as visitors see it.
  edit: boolean
  label: string
  // Drag group of the list holding the item (see `useBlocSortable`); no handle without it.
  group?: string
}>()

const emit = defineEmits<{
  delete: []
  keyboardMove: [KeyboardEvent]
}>()
</script>

<style>
/* Only the innermost hovered (or focused) item shows its outline and its tab: the editor
   stays as quiet as the page, whatever the nesting. */
[data-edit-tab] {
  opacity: 0;
  pointer-events: none;
  transition: opacity 100ms;
}

[data-edit-item]:is(:hover, :focus-within):not(:has([data-edit-item]:is(:hover, :focus-within))) {
  outline: 2px solid var(--color-new-primary);
  outline-offset: 6px;
  border-radius: 2px;
}

[data-edit-item]:is(:hover, :focus-within):not(:has([data-edit-item]:is(:hover, :focus-within))) > [data-edit-tab] {
  opacity: 1;
  pointer-events: auto;
}
</style>
