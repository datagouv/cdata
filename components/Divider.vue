<template>
  <div class="relative">
    <div
      class="absolute inset-0 flex items-center"
      aria-hidden="true"
    >
      <div
        class="w-full border-t"
        :class="color"
      />
    </div>
    <div class="relative flex justify-center">
      <span class="bg-white px-3 text-sm text-mention-grey"><slot /></span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  color?: string
}>(), {
  color: 'border-gray-300',
})
</script>
