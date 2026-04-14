<template>
  <SiteEditoPage
    :label="$t('Jeux de données')"
    site-key="datasets_blocs"
    public-page="/datasets"
  />
</template>

<script setup lang="ts">
import SiteEditoPage from '~/components/Pages/SiteEditoPage.vue'

definePageMeta({
  keepScroll: true,
})
</script>
