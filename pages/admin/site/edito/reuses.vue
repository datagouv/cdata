<template>
  <SiteEditoPage
    :label="$t('Réutilisations')"
    site-key="reuses_page_id"
    public-page="/reuses"
  />
</template>

<script setup lang="ts">
import SiteEditoPage from '~/components/Pages/SiteEditoPage.vue'
</script>
