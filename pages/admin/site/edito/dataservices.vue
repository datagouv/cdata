<template>
  <SiteEditoPage
    :label="$t('API')"
    site-key="dataservices_blocs"
    public-page="/dataservices"
  />
</template>

<script setup lang="ts">
import SiteEditoPage from '~/components/Pages/SiteEditoPage.vue'

definePageMeta({
  keepScroll: true,
})
</script>
