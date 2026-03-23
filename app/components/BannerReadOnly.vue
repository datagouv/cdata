<template>
  <SimpleBanner
    v-if="config.public.readOnlyMode"
    type="warning"
  >
    <div class="fr-container">
      {{ $t('Pour des raisons de sécurité, la création de nouveaux contenus est actuellement désactivée.') }}
    </div>
  </SimpleBanner>
</template>

<script setup lang="ts">
import { SimpleBanner } from '@datagouv/components-next'

const config = useRuntimeConfig()
</script>
