<template>
  <BrandedButton
    color="secondary-softer"
    icon-only
    :icon="RiInformationLine"
    size="xs"
    keep-margins-even-without-borders
  >
    <slot />
  </BrandedButton>
</template>

<script setup lang="ts">
import { RiInformationLine } from '@remixicon/vue'
import BrandedButton from './BrandedButton.vue'
</script>
