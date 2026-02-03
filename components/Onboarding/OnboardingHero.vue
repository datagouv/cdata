<template>
  <section
    class="py-16"
    :class="bgColor"
  >
    <div
      class="container text-white"
      :class="image ? 'flex flex-col md:flex-row items-center gap-12' : 'max-w-3xl text-center'"
    >
      <div
        v-if="image"
        class="flex-shrink-0"
      >
        <img
          :src="image"
          :alt="imageAlt || ''"
          :aria-hidden="!imageAlt"
          class="w-80"
        >
      </div>
      <div :class="image ? 'flex-1' : ''">
        <h1 class="text-white text-3xl md:text-4xl lg:text-4.5xl font-extrabold mb-4">
          <slot name="title" />
        </h1>
        <p
          v-if="$slots.subtitle"
          class="font-spectral font-normal italic text-2xl leading-8 text-white/80 mb-8"
        >
          <slot name="subtitle" />
        </p>
        <div
          v-if="$slots.actions"
          class="flex flex-wrap gap-4"
          :class="{ 'justify-center': !image }"
        >
          <slot name="actions" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  color?: 'primary' | 'green' | 'brown' | 'dark'
  image?: string
  imageAlt?: string
}>()

const bgColor = computed(() => ({
  primary: 'bg-new-blue-illustration',
  green: 'bg-new-green-illustration',
  brown: 'bg-new-brown-illustration',
  dark: 'bg-gray-dark',
}[props.color || 'primary']))
</script>
