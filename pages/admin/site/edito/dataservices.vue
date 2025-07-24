<template>
  <SiteEditoPage
    :label="$t('APIs')"
    site-key="dataservices_page_id"
    public-page="/dataservices"
  />
</template>

<script setup lang="ts">
import SiteEditoPage from '~/components/Pages/SiteEditoPage.vue'
</script>
