<template>
  <p class="text-sm text-gray-plain font-bold mb-0">
    {{ t("Qualité des métadonnées :") }}
  </p>
  <ul class="list-none pl-0 space-y-2">
    <DatasetQualityItem
      :passed="quality.has_description"
      :message-passed="t('Description renseignée')"
      :message-failed="t('Description non renseignée')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.has_machine_documentation"
      :message-passed="t('Documentation machine (OpenAPI) disponible')"
      :message-failed="t('Documentation machine (OpenAPI) manquante')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.has_technical_documentation"
      :message-passed="t('Documentation technique renseignée')"
      :message-failed="t('Documentation technique manquante')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.has_business_documentation"
      :message-passed="t('Documentation métier renseignée')"
      :message-failed="t('Documentation métier manquante')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.license"
      :message-passed="t('Licence renseignée')"
      :message-failed="t('Licence non renseignée')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.has_contact_point"
      :message-passed="t('Point de contact renseigné')"
      :message-failed="t('Point de contact non renseigné')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.has_base_api_url"
      :message-passed="t(`URL de base de l'API renseignée`)"
      :message-failed="t(`URL de base de l'API non renseignée`)"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.availability_documented"
      :message-passed="t('Disponibilité documentée')"
      :message-failed="t('Disponibilité non documentée')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.rate_limiting_documented"
      :message-passed="t(`Limite d'appels documentée`)"
      :message-failed="t(`Limite d'appels non documentée`)"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.access_conditions_clear"
      :message-passed="t(`Conditions d'accès claires`)"
      :message-failed="t(`Conditions d'accès non précisées`)"
      class="pb-0"
    />
  </ul>
</template>

<script setup lang="ts">
import type { DataserviceQuality } from '../types/dataservices'
import { useTranslation } from '../composables/useTranslation'
import DatasetQualityItem from './DatasetQualityItem.vue'

defineProps<{
  quality: DataserviceQuality
}>()

const { t } = useTranslation()
</script>
