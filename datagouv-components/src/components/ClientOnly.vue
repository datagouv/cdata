<template>
  <component
    :is="config?.clientOnly"
    v-if="config.clientOnly"
  >
    <slot />
    <!-- Nuxt's ClientOnly renders any fallback slot, even an empty one -->
    <template
      v-if="$slots.fallback"
      #fallback
    >
      <slot name="fallback" />
    </template>
  </component>
  <template v-else>
    <slot />
  </template>
</template>

<script setup lang="ts">
import { useComponentsConfig } from '../config'

const config = useComponentsConfig()
</script>
