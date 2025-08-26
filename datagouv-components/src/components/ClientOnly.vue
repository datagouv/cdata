<template>
  <component
    :is="config?.clientOnly"
    v-if="config.clientOnly"
  >
    <slot />
  </component>
  <template v-else>
    <slot />
  </template>
</template>

<script setup lang="ts">
import { useComponentsConfig } from '../config'

const config = useComponentsConfig()
</script>
