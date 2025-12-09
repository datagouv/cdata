<template>
  <section
    class="py-16"
    :class="bgColor"
  >
    <div class="container max-w-xl text-center">
      <h2 class="text-white font-extrabold text-3xl md:text-4xl mb-6">
        <slot name="title" />
      </h2>
      <div class="flex flex-wrap justify-center gap-4">
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
