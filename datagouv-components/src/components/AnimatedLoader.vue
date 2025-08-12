<script setup lang="ts">
import { RiLoader5Line } from '@remixicon/vue'

withDefaults(defineProps<{
  color?: 'primary' | 'white'
}>(), {
  color: 'primary',
})
</script>

<template>
  <RiLoader5Line
    class=" text-7xl animate-spin"
    :class="{
      'text-primary': color === 'primary',
      'text-white': color === 'white',
    }"
  />
</template>
