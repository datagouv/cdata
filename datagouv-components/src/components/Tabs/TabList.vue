<template>
  <TabList :class="underline ? 'flex gap-4 border-b border-gray-default' : 'fr-segmented__elements'">
    <slot />
  </TabList>
</template>

<script setup lang="ts">
import { TabList } from '@headlessui/vue'
import { inject, ref } from 'vue'
import { tabsUnderlineInjectionKey } from './tabsContext'

const underline = inject(tabsUnderlineInjectionKey, ref(false))
</script>

<style scoped>
.fr-segmented__elements {
    display: inline-flex;
}
</style>
