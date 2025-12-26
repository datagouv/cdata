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
    />
    <PopoverButton
      v-bind="buttonProps"
      class="border-transparent -outline-offset-2 inline-flex items-center justify-center hover:bg-gray-some"
      :class="{ 'w-8 h-8 rounded-full bg-transparent': styledButton }"
    >
      <slot>
        <RiInformationLine class="size-5" />
      </slot>
    </PopoverButton>

    <ClientOnly>
      <Teleport to="#tooltips">
        <PopoverPanel
          v-show="open"
          ref="panel"
          class="drop-shadow bg-white rounded-sm w-96 absolute z-[800]"
          :class="{
            'p-0': noMargin,
            'p-3': !noMargin,
          }"
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
import { autoPlacement, autoUpdate, useFloating } from '@floating-ui/vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { useTemplateRef } from 'vue'
import { RiInformationLine } from '@remixicon/vue'
import ClientOnly from './ClientOnly.vue'
import ValueWatcher from './ValueWatcher.vue'

withDefaults(defineProps<{
  buttonProps?: object
  noMargin?: boolean
  styledButton?: boolean
}>(), {
  styledButton: true,
})

const popoverRef = useTemplateRef<InstanceType<typeof Popover>>('popover')
const panelRef = useTemplateRef<InstanceType<typeof PopoverPanel>>('panel')

const { floatingStyles } = useFloating(popoverRef, panelRef, {
  middleware: [autoPlacement({
    alignment: 'end',
    crossAxis: true,
  })],
  whileElementsMounted: autoUpdate,
})
</script>
