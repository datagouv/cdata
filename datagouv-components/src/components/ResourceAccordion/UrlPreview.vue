<template>
  <div class="flex flex-col items-center py-12">
    <p class="fr-text--bold mb-1">
      {{ t('Ce lien renvoie vers une page externe.') }}
    </p>
    <p class="text-sm text-gray-medium mb-4 text-center max-w-lg">
      {{ t('Ce n\'est pas un fichier téléchargeable : suivez le lien pour consulter la ressource.') }}
    </p>
    <BrandedButton
      :href="resource.url"
      new-tab
      rel="ugc nofollow noopener"
    >
      {{ t('Visiter la ressource') }}
    </BrandedButton>
  </div>
</template>

<script setup lang="ts">
import BrandedButton from '../BrandedButton.vue'
import type { Resource } from '../../types/resources'
import { useTranslation } from '../../composables/useTranslation'

defineProps<{
  resource: Resource
}>()

const { t } = useTranslation()
</script>
