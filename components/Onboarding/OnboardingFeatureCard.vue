<template>
  <div class="border border-gray-default rounded bg-white p-4 flex flex-col h-full">
    <div
      v-if="image"
      class="mb-4 rounded overflow-hidden bg-gray-some"
    >
      <NuxtImg
        :src="image"
        :alt="imageAlt || ''"
        class="w-full h-auto"
        loading="lazy"
      />
    </div>
    <h3 class="text-lg font-bold text-gray-title mb-2">
      {{ title }}
    </h3>
    <p class="text-gray-medium text-sm flex-1 mb-0">
      {{ description }}
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  image?: string
  imageAlt?: string
}>()
</script>
