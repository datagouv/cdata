<template>
  <TranslationT
    keypath="Les champs précédés d'une étoile ({markup}) sont obligatoires."
    tag="p"
    class="mt-0 mb-2 text-xs"
  >
    <template #markup>
      <span class="text-primary">*</span>
    </template>
  </TranslationT>
</template>

<script setup lang="ts">
import { TranslationT } from '@datagouv/components-next'
</script>
