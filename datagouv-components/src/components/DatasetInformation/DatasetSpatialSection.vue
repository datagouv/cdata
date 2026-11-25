<template>
  <MetadataSection
    v-if="hasValue"
    :title="t('Couverture spatiale')"
  >
    <DescriptionList>
      <div>
        <DescriptionListTerm>{{ t('Zones') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <template v-if="dataset.spatial?.zones?.length">
            {{ zonesDisplay }}
          </template>
          <MetadataEmptyValue v-else />
        </DescriptionListDetails>
      </div>
      <div>
        <DescriptionListTerm>{{ t('Couverture géographique') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <slot
            v-if="dataset.spatial?.geom"
            name="map"
            :geojson="dataset.spatial.geom"
          />
          <MetadataEmptyValue v-else />
        </DescriptionListDetails>
      </div>
      <div>
        <DescriptionListTerm>{{ t('Granularité de la couverture territoriale') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <template v-if="dataset.spatial?.granularity">
            {{ dataset.spatial.granularity.name }}
          </template>
          <MetadataEmptyValue v-else />
        </DescriptionListDetails>
      </div>
      <slot />
    </DescriptionList>
  </MetadataSection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../../composables/useTranslation'
import { humanJoin } from '../../functions/helpers'
import type { DatasetV2WithFullObject } from '../../types/datasets'
import DescriptionList from '../DescriptionList.vue'
import DescriptionListTerm from '../DescriptionListTerm.vue'
import DescriptionListDetails from '../DescriptionListDetails.vue'
import MetadataSection from './MetadataSection.vue'
import MetadataEmptyValue from '../MetadataEmptyValue.vue'

const props = defineProps<{
  dataset: DatasetV2WithFullObject
}>()

const { t } = useTranslation()

// A category with no filled metadata at all is not shown.
const hasValue = computed(() => Boolean(props.dataset.spatial?.zones?.length || props.dataset.spatial?.geom || props.dataset.spatial?.granularity))

const zonesDisplay = computed(() => {
  if (!props.dataset.spatial?.zones?.length) return ''
  const names = props.dataset.spatial.zones.map(z => z.name)
  return humanJoin(names)
})
</script>
