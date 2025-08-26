<template>
  <Popover
    v-slot="{ open, close }"
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
    <PopoverButton ref="button">
      <BrandedButton
        color="secondary-softer"
        icon-only
        :icon="RiInformationLine"
        size="xs"
        keep-margins-even-without-borders
        v-bind="buttonProps"
      >
        <slot />
      </BrandedButton>
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

const buttonRef = useTemplateRef('button')
const panelStyle = ref({})

// Since the parent of the component can have an overflow-hidden
// we teleport the popover to a #tooltips div in the layout.
// We need to compute the correct position of the tooltip.
const calculatePanelPosition = () => {
  nextTick(() => {
    const button = buttonRef.value?.$el || buttonRef.value
    const tooltips = document.getElementById('tooltips')

    if (!button || !tooltips) {
      console.warn('Cannot find the button or the tooltips\' teleport target (maybe you forget to add <div id="tooltips" /> in your layout.)')
      return
    }

    const buttonRect = button.getBoundingClientRect()
    const tooltipsRect = tooltips.getBoundingClientRect()

    const relativeX = buttonRect.left - tooltipsRect.left
    const relativeY = buttonRect.bottom - tooltipsRect.top

    panelStyle.value = {
      left: `${relativeX}px`,
      top: `${relativeY}px`,
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
