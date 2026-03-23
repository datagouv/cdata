<template>
  <div
    class="w-full flex items-center justify-between"
    aria-hidden="true"
  >
    <div
      class="flex-1 h-px"
      :class="color"
    />
    <div
      v-if="$slots.default"
      class="px-3 text-sm text-mention-grey"
    >
      <slot />
    </div>
    <div
      class="flex-1 h-px"
      :class="color"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  color?: string
}>(), {
  color: 'bg-gray-300',
})
</script>
