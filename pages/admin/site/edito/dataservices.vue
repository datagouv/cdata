<template>
  <SiteEditoPage
    :label="$t('APIs')"
    site-key="dataservices_page"
    public-page="/dataservices"
  />
</template>

<script setup lang="ts">
import SiteEditoPage from '~/components/Pages/SiteEditoPage.vue'

definePageMeta({
  keepScroll: true,
})
</script>
