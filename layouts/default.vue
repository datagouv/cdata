<script setup lang="ts">
// Workaround: layout setup re-runs client-side when navigating between layouts (e.g. fluid → default),
// but defineOgImage throws in client context. This is likely a nuxt-og-image bug.
// See https://github.com/nuxt-modules/og-image/pull/293
if (import.meta.server) {
  defineOgImage('Default.takumi')
}
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
