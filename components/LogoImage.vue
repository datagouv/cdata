<template>
  <!-- We translate to center the SVG which is asymetric. -->
  <nuxt-img
    v-if="config.public.isFrenchGovernment"
    src="/nuxt_images/logo_text.svg"
    class="inline -translate-y-[15%]"
  />
  <p
    v-else
    class="inline -translate-y-[15%]"
  >
    Service logo
  </p>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
</script>
