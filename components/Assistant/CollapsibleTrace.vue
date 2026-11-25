<template>
  <Disclosure
    v-slot="{ open }"
    as="section"
    class="overflow-hidden rounded-md border border-new-gray-light text-xs"
  >
    <DisclosureButton class="flex w-full items-center gap-2 px-2.5 py-2 text-left hover:bg-gray-100">
      <component
        :is="icon"
        class="size-3.5 shrink-0 text-new-gray-medium"
        aria-hidden="true"
      />
      <span class="min-w-0 flex-1">
        <slot name="header" />
      </span>
      <slot name="status" />
      <RiArrowDownLine
        class="size-3.5 shrink-0 text-new-gray-medium transition-transform duration-200 motion-reduce:transition-none"
        :class="{ 'rotate-180': open }"
        aria-hidden="true"
      />
    </DisclosureButton>
    <!-- static keeps the panel rendered for the grid-rows transition; inert keeps it out of the accessibility tree while collapsed -->
    <DisclosurePanel
      static
      class="grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none"
      :class="open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
      :inert="!open || undefined"
    >
      <div class="min-h-0 overflow-hidden">
        <div class="border-t border-new-gray-light px-2.5 pb-2.5 pt-2">
          <slot />
        </div>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { RiArrowDownLine } from '@remixicon/vue'
import type { Component } from 'vue'

defineProps<{
  icon: Component
}>()
</script>
