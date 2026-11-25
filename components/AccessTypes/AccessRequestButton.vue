<template>
  <!-- Placed at the end of the side metadata, before its banners. -->
  <div v-if="object.authorization_request_url">
    <BrandedButton
      color="primary"
      size="sm"
      :href="object.authorization_request_url"
      new-tab
    >
      {{ $t("Demander un accès") }}
    </BrandedButton>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, type WithAccessType } from '@datagouv/components-next'

defineProps<{
  object: WithAccessType
}>()
</script>
