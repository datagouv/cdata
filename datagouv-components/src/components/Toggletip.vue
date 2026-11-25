<template>
  <Popover
    v-slot="{ open, close }"
    ref="popover"
    class="relative"
  >
    <!--
      Little trick to watch for v-slot changes because HeadlessUI doesn't raise an event on open… :-(
      Need to recompute on show because sometimes, the positions where incorrect because after first render, some div load and change the relative position of the button…
    -->
    <ValueWatcher
      :value="open"
      @changed="onOpenChanged"
    />
    <PopoverButton
      v-bind="buttonProps"
      :class="[
        buttonClass ?? 'border-transparent -outline-offset-2 inline-flex items-center justify-center hover:bg-gray-some',
        { 'w-8 h-8 rounded-full bg-transparent': styledButton && !buttonClass },
      ]"
    >
      <slot>
        <RiInformationLine
          class="size-5"
          aria-hidden="true"
        />
      </slot>
    </PopoverButton>

    <ClientOnly>
      <Teleport to="#tooltips">
        <PopoverPanel
          v-show="open"
          ref="panel"
          class="absolute z-[800] w-[min(24rem,calc(100vw-2rem))] max-h-[70vh] overflow-auto rounded border border-gray-default bg-white shadow-overlay"
          :class="noMargin ? 'p-0' : 'p-4'"
          :style="floatingStyles"
          static
        >
          <slot
            name="toggletip"
            :close
          />
        </PopoverPanel>
      </Teleport>
    </ClientOnly>
  </Popover>
</template>

<script setup lang="ts">
import { autoPlacement, autoUpdate, offset, shift, useFloating } from '@floating-ui/vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { nextTick, useTemplateRef } from 'vue'
import { RiInformationLine } from '@remixicon/vue'
import ClientOnly from './ClientOnly.vue'
import ValueWatcher from './ValueWatcher.vue'

withDefaults(defineProps<{
  buttonProps?: object
  buttonClass?: string
  noMargin?: boolean
  styledButton?: boolean
}>(), {
  styledButton: true,
})

const emit = defineEmits<{
  opened: []
}>()

const popoverRef = useTemplateRef<InstanceType<typeof Popover>>('popover')
const panelRef = useTemplateRef<InstanceType<typeof PopoverPanel>>('panel')

const { floatingStyles, update } = useFloating(popoverRef, panelRef, {
  middleware: [
    offset(8),
    autoPlacement({
      alignment: 'end',
      crossAxis: true,
    }),
    shift({ padding: 16 }),
  ],
  whileElementsMounted: autoUpdate,
})

async function onOpenChanged(open: boolean) {
  if (open) emit('opened')
  await nextTick()
  update()
}
</script>
