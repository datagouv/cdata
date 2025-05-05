<template>
  <Popover
    v-slot="{ open }"
    class="relative text-gray-title"
    :focus="true"
  >
    <PopoverButton
      v-bind="$attrs"
      ref="button"
      :as="ToggletipButton"
    >
      <slot />
    </PopoverButton>
    <component
      :is="teleportId ? Teleport : 'div'"
      v-if="open"
      :to="`#${teleportId}`"
      :defer="teleportId ? true : undefined"
    >
      <PopoverPanel
        ref="toggletip"
        v-slot="{ close }"
        class="toggletip"
        :class="{
          'p-0': noMargin,
          'left-0': position === 'right',
          'ml-6 top-24': teleportId,
        }"
      >
        <slot
          name="toggletip"
          :close
        />
      </PopoverPanel>
    </component>
  </Popover>
</template>

<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { Teleport } from 'vue'
import ToggletipButton from './ToggletipButton.vue'

withDefaults(defineProps<{
  noMargin?: boolean
  position?: 'left' | 'right'
  teleportId?: string
}>(), {
  noMargin: false,
  position: 'left',
})
defineOptions({ inheritAttrs: false })
</script>

  <style scoped>
  .z-10 {
    z-index: 10;
  }
  .left-0 {
    left: 0;
  }
  </style>
