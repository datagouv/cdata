<template>
  <MetadataSection
    v-if="hasValue"
    :title="t('Temporalité')"
  >
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
      <div>
        <DescriptionListTerm>{{ t('Fréquence') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <template v-if="dataset.frequency">
            {{ dataset.frequency.label }}
          </template>
          <MetadataEmptyValue v-else />
        </DescriptionListDetails>
      </div>
      <div>
        <DescriptionListTerm>{{ t('Prochaine mise à jour prévue') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <FormattedDate
            v-if="dataset.frequency_date"
            :date="dataset.frequency_date"
          />
          <MetadataEmptyValue v-else />
        </DescriptionListDetails>
      </div>
      <div>
        <DescriptionListTerm>{{ t('Couverture temporelle') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <DateRangeDetails
            v-if="dataset.temporal_coverage"
            :range="dataset.temporal_coverage"
          />
          <MetadataEmptyValue v-else />
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
import MetadataEmptyValue from '../MetadataEmptyValue.vue'
import { computed } from 'vue'

const props = defineProps<{
  dataset: DatasetV2WithFullObject
}>()

// A category with no filled metadata at all is not shown.
const hasValue = computed(() => Boolean(props.dataset.created_at || props.dataset.last_modified || props.dataset.frequency
  || props.dataset.frequency_date || props.dataset.temporal_coverage || props.dataset.last_update))

const { t } = useTranslation()
</script>
