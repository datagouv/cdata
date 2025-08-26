<template>
  <Popover
    v-slot="{ open, close }"
    class="relative"
  >
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
  </Popover>
</template>

<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { nextTick, onMounted, onUpdated, ref, useTemplateRef } from 'vue'
import { RiInformationLine } from '@remixicon/vue'
import BrandedButton from './BrandedButton.vue'

defineProps<{
  buttonProps?: object
  noMargin?: boolean
}>()
defineOptions({ inheritAttrs: false })

const buttonRef = useTemplateRef('button')
const panelStyle = ref({})

// Since the parent of the component can have an overflow-hidden
// we teleport the popover to a #tooltips div in the layout.
// We need to compute the correct position of the tooltip.
const calculatePanelPosition = () => {
  nextTick(() => {
    const button = buttonRef.value?.$el || buttonRef.value
    const tooltips = document.getElementById('tooltips')

    if (button && tooltips) {
      const buttonRect = button.getBoundingClientRect()
      const tooltipsRect = tooltips.getBoundingClientRect()

      const relativeX = buttonRect.left - tooltipsRect.left
      const relativeY = buttonRect.bottom - tooltipsRect.top

      panelStyle.value = {
        left: `${relativeX}px`,
        top: `${relativeY}px`,
      }
    }
    else {
      console.warn('Cannot find button or tooltips')
    }
  })
}

onMounted(() => calculatePanelPosition())
onUpdated(() => calculatePanelPosition())
</script>
