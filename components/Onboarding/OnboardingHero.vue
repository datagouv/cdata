<template>
  <HeroBanner :color="color">
    <template
      v-if="$slots.breadcrumb"
      #breadcrumb
    >
      <slot name="breadcrumb" />
    </template>
    <div :class="image ? 'flex flex-col md:flex-row items-center gap-12' : { 'max-w-3xl mx-auto text-center': !alignLeft }">
      <div
        v-if="image"
        class="flex-shrink-0"
        :class="{ 'md:order-last': imagePosition === 'right' }"
      >
        <img
          :src="image"
          :alt="imageAlt || ''"
          :aria-hidden="!imageAlt"
          class="w-80"
        >
      </div>
      <div :class="image ? 'flex-1' : { 'max-w-3xl': alignLeft }">
        <h1 class="text-white text-3xl md:text-4xl lg:text-4.5xl font-extrabold mb-4">
          <slot name="title" />
        </h1>
        <p
          v-if="$slots.subtitle"
          class="font-spectral font-normal italic text-2xl leading-8 text-white/80"
          :class="{ 'mb-8': $slots.actions }"
        >
          <slot name="subtitle" />
        </p>
        <div
          v-if="$slots.actions"
          class="flex flex-wrap gap-4"
          :class="{ 'justify-center': !image && !alignLeft }"
        >
          <slot name="actions" />
        </div>
      </div>
    </div>
  </HeroBanner>
</template>

<script setup lang="ts">
import HeroBanner from '~/components/HeroBanner.vue'

const props = defineProps<{
  color?: 'primary' | 'green' | 'brown' | 'dark'
  image?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right'
  align?: 'center' | 'left'
}>()

const alignLeft = computed(() => props.align === 'left')
</script>
