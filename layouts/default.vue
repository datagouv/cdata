<script setup lang="ts">
defineOgImage('Default.takumi')
</script>

<template>
  <div
    class="group/layout"
    :data-with-container="true"
  >
    <SiteHeader />
    <BannerReadOnly />
    <slot />
    <SiteFooter />
  </div>
</template>
