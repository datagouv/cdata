<template>
  <FullPageTabs
    :links="[
      { label: $t('Présentation'), href: '/design' },
      { label: $t('Jeux de données'), href: getOrganizationUrl('datasets'), count: 12 },
      { label: $t('API'), href: getOrganizationUrl('dataservices') },
      { label: $t('Réutilisations'), href: getOrganizationUrl('reuses'), count: 0 },
      { label: $t('Information'), href: getOrganizationUrl('Information') },
    ]"
  />
</template>

<script setup lang="ts">
import FullPageTabs from '~/components/FullPageTabs/FullPageTabs.vue'

function getOrganizationUrl(tab?: string) {
  return tab ? `/organizations/someId/${tab}/` : `/organizations/someId/`
}
</script>
