<template>
  <!-- A metadata that is not filled: a dash on screen, a word for screen readers
       (which would otherwise read "dash"). -->
  <span class="text-gray-secondary">
    <span aria-hidden="true">—</span>
    <span class="sr-only">{{ t('Non renseigné') }}</span>
  </span>
</template>

<script setup lang="ts">
import { useTranslation } from '../composables/useTranslation'

const { t } = useTranslation()
</script>
