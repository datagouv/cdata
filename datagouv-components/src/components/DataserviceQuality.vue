<template>
  <Toggletip
    :styled-button="false"
    button-class="flex items-center gap-1 rounded-sm p-1.5 -m-1.5 border-transparent -outline-offset-2 hover:bg-gray-some transition-colors w-full text-left"
    :button-props="{ title: t('Qualité des métadonnées') }"
  >
    <QualityScore
      :score="quality.score"
      class="w-full"
    />
    <RiInformationLine
      class="size-5 shrink-0"
      aria-hidden="true"
    />
    <template #toggletip>
      <DataserviceQualityTooltipContent :quality />
    </template>
  </Toggletip>
  <template v-if="!hideWarnings">
    <ul class="list-none pl-0">
      <QualityItemWarning
        :quality-item="quality.has_description"
        :message="t('Description non renseignée')"
      />
      <QualityItemWarning
        :quality-item="quality.has_machine_documentation"
        :message="t('Documentation machine (OpenAPI) manquante')"
      />
      <QualityItemWarning
        :quality-item="quality.has_technical_documentation"
        :message="t('Documentation technique manquante')"
      />
      <QualityItemWarning
        :quality-item="quality.has_business_documentation"
        :message="t('Documentation métier manquante')"
      />
      <QualityItemWarning
        :quality-item="quality.license"
        :message="t('Licence non renseignée')"
      />
      <QualityItemWarning
        :quality-item="quality.has_contact_point"
        :message="t('Point de contact non renseigné')"
      />
      <QualityItemWarning
        :quality-item="quality.has_base_api_url"
        :message="t(`URL de base de l'API non renseignée`)"
      />
      <QualityItemWarning
        :quality-item="quality.availability_documented"
        :message="t('Disponibilité non documentée')"
      />
      <QualityItemWarning
        :quality-item="quality.rate_limiting_documented"
        :message="t(`Limite d'appels non documentée`)"
      />
      <QualityItemWarning
        :quality-item="quality.access_conditions_clear"
        :message="t(`Conditions d'accès non précisées`)"
      />
    </ul>
  </template>
</template>

<script setup lang="ts">
import { RiInformationLine } from '@remixicon/vue'
import type { DataserviceQuality } from '../types/dataservices'
import QualityScore from './QualityScore.vue'
import QualityItemWarning from './QualityItemWarning.vue'
import DataserviceQualityTooltipContent from './DataserviceQualityTooltipContent.vue'
import Toggletip from './Toggletip.vue'
import { useTranslation } from '../composables/useTranslation'

withDefaults(defineProps<{
  quality: DataserviceQuality
  hideWarnings?: boolean
}>(), {
  hideWarnings: false,
})

const { t } = useTranslation()
</script>
