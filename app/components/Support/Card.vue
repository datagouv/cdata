<template>
  <div class="shadow-[0_8px_16px_0_rgba(0,0,0,0.1),0_16px_16px_-16px_rgba(0,0,0,0.32)]">
    <div class="relative bg-gray-lower h-96 p-[12%] flex items-center">
      <div class="bg-black opacity-[2%]" />
      <NuxtImg
        :src="image"
        alt=""
      />
    </div>
    <div class="p-4 space-y-2.5">
      <p class="uppercase font-bold text-sm text-gray-medium m-0">
        {{ title }}
      </p>
      <p class="text-lg font-bold m-0">
        {{ description }}
      </p>
      <div class="flex justify-end">
        <slot name="link" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  image: string
  title: string
  description: string
}>()
</script>
