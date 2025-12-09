<template>
  <section
    class="py-12 md:py-16"
    :class="bgClass"
  >
    <div class="container">
      <h2
        v-if="title"
        class="text-2xl md:text-3xl font-bold text-gray-title mb-8"
      >
        {{ title }}
      </h2>
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  title?: string
  background?: 'white' | 'gray' | 'dark'
}>()

const bgClass = computed(() => ({
  white: 'bg-white',
  gray: 'bg-gray-some',
  dark: 'bg-gray-dark text-white',
}[props.background || 'white']))
</script>
