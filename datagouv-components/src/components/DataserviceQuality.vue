<template>
  <!-- Same display for datasets and dataservices, as on their pages in production: the label
       and the information icon, the full-width score, then the missing items. -->
  <div class="grid gap-2">
    <Toggletip
      :styled-button="false"
      button-class="grid w-full gap-1.5 rounded-sm p-1.5 -m-1.5 border-transparent -outline-offset-2 text-left transition-colors hover:bg-gray-some"
      :button-props="{ title: t('Qualité des métadonnées') }"
    >
      <span class="flex items-center justify-between gap-2">
        <span class="text-sm/5 font-normal text-gray-secondary">{{ t('Qualité des métadonnées') }}</span>
        <RiInformationLine
          class="size-4 shrink-0 text-gray-secondary"
          aria-hidden="true"
        />
      </span>
      <QualityScore
        :score="quality.score"
        class="w-full"
      />
      <template #toggletip>
        <DataserviceQualityTooltipContent :quality />
      </template>
    </Toggletip>
    <template v-if="!hideWarnings">
      <ul class="m-0 list-none space-y-1 p-0">
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
  </div>
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
