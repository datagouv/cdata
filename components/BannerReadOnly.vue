<template>
  <BannerSticky
    v-if="config.public.readOnlyMode"
    type="warning"
  >
    {{ $t('Pour des raisons de sécurité, la création de nouveaux contenus est actuellement désactivée.') }}
  </BannerSticky>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
</script>
