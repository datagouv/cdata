<template>
  <section class="overflow-hidden rounded-md border border-new-gray-light text-xs">
    <button
      type="button"
      :aria-expanded="expanded"
      :aria-controls="panelId"
      class="flex w-full items-center gap-2 px-2.5 py-2 text-left hover:bg-gray-100"
      @click="expanded = !expanded"
    >
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
        :class="{ 'rotate-180': expanded }"
        aria-hidden="true"
      />
    </button>
    <!-- inert keeps the visually collapsed panel out of the accessibility tree -->
    <div
      :id="panelId"
      class="grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none"
      :class="expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
      :inert="!expanded || undefined"
    >
      <div class="min-h-0 overflow-hidden">
        <div class="border-t border-new-gray-light px-2.5 pb-2.5 pt-2">
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RiArrowDownLine } from '@remixicon/vue'
import type { Component } from 'vue'
import { ref, useId } from 'vue'

defineProps<{
  icon: Component
}>()

const expanded = ref(false)
const panelId = useId()
</script>
