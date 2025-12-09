<template>
  <section
    class="py-16"
    :class="bgColor"
  >
    <div class="container max-w-4xl text-center text-white">
      <h1 class="font-spectral text-3xl md:text-4xl lg:text-4.5xl font-bold mb-4">
        <slot name="title" />
      </h1>
      <p
        v-if="$slots.subtitle"
        class="text-lg md:text-xl text-white/80 mb-8 italic"
      >
        <slot name="subtitle" />
      </p>
      <div
        v-if="$slots.actions"
        class="flex flex-wrap justify-center gap-4"
      >
        <slot name="actions" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  color?: 'primary' | 'green' | 'brown'
}>()

const bgColor = computed(() => ({
  primary: 'bg-new-primary',
  green: 'bg-new-green-illustration',
  brown: 'bg-new-brown-illustration',
}[props.color || 'primary']))
</script>
