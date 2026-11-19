<template>
  <span class="inline-flex h-6 min-w-0 items-center gap-1 rounded border border-new-primary/20 bg-new-primary/10 pl-1.5 pr-0.5 text-[12px] leading-4 text-new-primary">
    <component
      :is="icon"
      v-if="icon"
      class="size-3.5 shrink-0"
      aria-hidden="true"
    />
    <span class="font-medium shrink-0">{{ name }}</span>
    <span
      class="truncate"
      :title="value"
    >{{ value }}</span>
    <button
      type="button"
      :aria-label="removeLabel"
      class="flex size-5 shrink-0 items-center justify-center rounded hover:bg-new-primary/15"
      @click="emit('remove')"
    >
      <RiCloseLine
        class="size-3.5"
        aria-hidden="true"
      />
    </button>
  </span>
</template>

<script setup lang="ts">
import { RiCloseLine } from '@remixicon/vue'
import type { Component } from 'vue'

defineProps<{
  icon?: Component
  name: string
  value: string
  removeLabel: string
}>()

const emit = defineEmits<{
  remove: []
}>()
</script>
