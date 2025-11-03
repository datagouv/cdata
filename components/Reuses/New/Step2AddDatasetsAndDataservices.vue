<template>
  <div class="fr-p-3w bg-white">
    <SimpleBanner
      type="primary"
      class="fr-mb-2w"
    >
      <div class="fr-grid-row">
        <div class="fr-col-auto fr-mr-3v">
          <span
            class="fr-icon-info-line"
            aria-hidden="true"
          />
        </div>
        <div class="fr-col">
          <p class="fr-m-0 fr-text--xs">
            {{ t('Il est important d’associer tous les jeux de données utilisés, car cela permet de comprendre les croisements qui ont été nécessaires et d’améliorer la visibilité de votre réutilisation.') }}
          </p>
        </div>
      </div>
    </SimpleBanner>

    <div class="space-y-16">
      <DatasetsSelect v-model="datasets" />
      <DataservicesSelect v-model="dataservices" />
      <div class="fr-grid-row justify-between">
        <BrandedButton
          color="secondary"
          @click="$emit('previous')"
        >
          {{ t("Précédent") }}
        </BrandedButton>
        <BrandedButton
          color="primary"
          :disabled="!datasets.length"
          :loading
          @click="$emit('next')"
        >
          {{ t("Suivant") }}
        </BrandedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, type Dataservice, SimpleBanner, type DatasetV2 } from '@datagouv/components-next'
import type { DatasetSuggest } from '~/types/types'

defineProps<{ loading: boolean }>()

defineEmits<{
  previous: []
  next: []
}>()

const datasets = defineModel<Array<DatasetV2 | DatasetSuggest>>('datasets', { required: true })
const dataservices = defineModel<Array<Dataservice>>('dataservices', { required: true })

const { t } = useTranslation()
</script>
