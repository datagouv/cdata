<script setup lang="ts">
if (import.meta.server) {
  defineOgImage('Default.takumi')
}
</script>

<template>
  <div
    class="group/layout flex flex-col"
    :data-with-container="false"
  >
    <SiteHeader :fluid="true" />
    <BannerReadOnly :fluid="true" />
    <slot />
  </div>
</template>
