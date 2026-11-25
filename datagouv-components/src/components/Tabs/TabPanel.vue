<template>
  <TabPanel :unmount>
    <slot />
  </TabPanel>
</template>

<script setup lang="ts">
import { TabPanel } from '@headlessui/vue'

withDefaults(defineProps<{
  // false keeps a hidden panel mounted, and its state with it
  unmount?: boolean
}>(), {
  unmount: true,
})
</script>
