<template>
  <div class="fr-p-3w bg-white">
    <SimpleBanner
      type="primary"
      class="mb-4 flex items-center space-x-2"
    >
      <RiInformationLine class="shink-0 size-6" />
      <p class="w-full mb-0">
        {{ t('Il est important d’associer tous les jeux de données utilisés, car cela permet de comprendre les croisements qui ont été nécessaires et d’améliorer la visibilité de votre réutilisation.') }}
      </p>
    </SimpleBanner>
    <DatasetsSelect v-model="datasets" />
    <div class="fr-grid-row justify-between">
      <BrandedButton
        color="secondary"
        @click="$emit('previous')"
      >
        {{ t("Précédent") }}
      </BrandedButton>
      <BrandedButton
        :loading
        color="secondary"
        @click="$emit('next')"
      >
        {{ t("Suivant") }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { SimpleBanner, type Dataset, type DatasetV2 } from '@datagouv/components-next'
import { RiInformationLine } from '@remixicon/vue'
import type { DatasetSuggest } from '~/types/types'

defineProps<{
  loading: boolean
}>()

defineEmits<{
  previous: []
  next: []
}>()

const { t } = useTranslation()

const datasets = defineModel<Array<Dataset | DatasetV2 | DatasetSuggest>>({ required: true })
</script>
