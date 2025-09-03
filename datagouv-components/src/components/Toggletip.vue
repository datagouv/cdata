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
      @changed="calculatePanelPosition"
    />
    <PopoverButton
      color="secondary-softer"
      :as="BrandedButton"
      icon-only
      :icon="RiInformationLine"
      size="xs"
      keep-margins-even-without-borders
      v-bind="buttonProps"
    >
      <slot />
    </PopoverButton>

    <ClientOnly>
      <Teleport to="#tooltips">
        <PopoverPanel
          v-show="open"
          class="toggletip absolute z-10"
          :class="{
            'p-0': noMargin,
          }"
          :style="panelStyle"
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
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useTemplateRef } from 'vue'
import { RiInformationLine } from '@remixicon/vue'
import BrandedButton from './BrandedButton.vue'
import ClientOnly from './ClientOnly.vue'
import ValueWatcher from './ValueWatcher.vue'

defineProps<{
  buttonProps?: object
  noMargin?: boolean
}>()

const popoverRef = useTemplateRef('popover')
const panelStyle = ref({})

// Since the parent of the component can have an overflow-hidden
// we teleport the popover to a #tooltips div in the layout.
// We need to compute the correct position of the tooltip.
const calculatePanelPosition = () => {
  nextTick(() => {
    const popover = popoverRef.value?.$el

    if (!popover) {
      console.error('Cannot find the popover of the Toggletip.)')
      return
    }
    console.log(popover)
    const popoverRect = popover.getBoundingClientRect()
    panelStyle.value = {
      left: `${popoverRect.left + window.scrollX}px`,
      top: `${popoverRect.bottom + window.scrollY}px`,
    }
  })
}

onMounted(() => {
  calculatePanelPosition()
  window.addEventListener('resize', calculatePanelPosition)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', calculatePanelPosition)
})

onUpdated(() => calculatePanelPosition())
</script>
