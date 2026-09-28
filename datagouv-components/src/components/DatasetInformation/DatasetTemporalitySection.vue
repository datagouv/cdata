<template>
  <div class="space-y-1 py-6">
    <h3 class="uppercase text-gray-plain text-sm font-bold">
      {{ t('Temporalité') }}
    </h3>
    <DescriptionList>
      <div>
        <DescriptionListTerm>{{ t('Création') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <FormattedDate :date="dataset.created_at" />
        </DescriptionListDetails>
      </div>
      <div v-if="dataset.frequency">
        <DescriptionListTerm>{{ t('Fréquence') }}</DescriptionListTerm>
        <DescriptionListDetails>{{ dataset.frequency.label }}</DescriptionListDetails>
      </div>
      <div v-if="dataset.temporal_coverage">
        <DescriptionListTerm>{{ t('Couverture temporelle') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <DateRangeDetails :range="dataset.temporal_coverage" />
        </DescriptionListDetails>
      </div>
      <div>
        <DescriptionListTerm>{{ t('Dernière mise à jour') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <FormattedDate :date="dataset.last_update" />
        </DescriptionListDetails>
      </div>
      <slot />
    </DescriptionList>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/useTranslation'
import type { DatasetV2WithFullObject } from '../../types/datasets'
import DescriptionList from '../DescriptionList.vue'
import DescriptionListTerm from '../DescriptionListTerm.vue'
import DescriptionListDetails from '../DescriptionListDetails.vue'
import DateRangeDetails from '../DateRangeDetails.vue'
import FormattedDate from '../FormattedDate.vue'

defineProps<{
  dataset: DatasetV2WithFullObject
}>()

const { t } = useTranslation()
</script>
