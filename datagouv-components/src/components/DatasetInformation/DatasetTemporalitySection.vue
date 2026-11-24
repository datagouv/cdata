<template>
  <MetadataSection :title="t('Temporalité')">
    <DescriptionList>
      <div>
        <DescriptionListTerm>{{ t('Création') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <FormattedDate :date="dataset.created_at" />
        </DescriptionListDetails>
      </div>
      <div>
        <DescriptionListTerm>{{ t('Dernière modification de la fiche') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <FormattedDate :date="dataset.last_modified" />
        </DescriptionListDetails>
      </div>
      <div v-if="dataset.frequency">
        <DescriptionListTerm>{{ t('Fréquence') }}</DescriptionListTerm>
        <DescriptionListDetails>{{ dataset.frequency.label }}</DescriptionListDetails>
      </div>
      <div v-if="dataset.frequency_date">
        <DescriptionListTerm>{{ t('Prochaine mise à jour prévue') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <FormattedDate :date="dataset.frequency_date" />
        </DescriptionListDetails>
      </div>
      <div v-if="dataset.temporal_coverage">
        <DescriptionListTerm>{{ t('Couverture temporelle') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <DateRangeDetails :range="dataset.temporal_coverage" />
        </DescriptionListDetails>
      </div>
      <div>
        <DescriptionListTerm>{{ t('Dernière mise à jour des ressources') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <FormattedDate :date="dataset.last_update" />
        </DescriptionListDetails>
      </div>
      <slot />
    </DescriptionList>
  </MetadataSection>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/useTranslation'
import type { DatasetV2WithFullObject } from '../../types/datasets'
import DescriptionList from '../DescriptionList.vue'
import DescriptionListTerm from '../DescriptionListTerm.vue'
import DescriptionListDetails from '../DescriptionListDetails.vue'
import DateRangeDetails from '../DateRangeDetails.vue'
import FormattedDate from '../FormattedDate.vue'
import MetadataSection from './MetadataSection.vue'

defineProps<{
  dataset: DatasetV2WithFullObject
}>()

const { t } = useTranslation()
</script>
