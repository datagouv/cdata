<template>
  <SiteEditoPage
    :label="$t('Réutilisations')"
    site-key="reuses_page"
    public-page="/reuses"
  />
</template>

<script setup lang="ts">
import SiteEditoPage from '~/components/Pages/SiteEditoPage.vue'

definePageMeta({
  keepScroll: true,
})
</script>
