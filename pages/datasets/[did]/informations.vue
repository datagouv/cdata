<template>
  <div class="divide-y">
    <DatasetInformationSection
      :dataset="dataset"
      :tag-url="(tag) => `/datasets?tag=${tag}`"
    />
    <DatasetTemporalitySection :dataset="dataset" />
    <DatasetSpatialSection :dataset="dataset">
      <template #map="{ geojson }">
        <ClientOnly>
          <LeafletMap :geojson="geojson" />
        </ClientOnly>
      </template>
    </DatasetSpatialSection>
    <DatasetSchemaSection :dataset="dataset" />
    <DatasetEmbedSection :dataset="dataset" />
    <div>
      <ExtraAccordion
        v-if="dataset.extras && Object.keys(dataset.extras).length"
        class="pt-6"
        :button-text="$t('Voir les extras')"
        :title-text="$t('Extras')"
        :extra="dataset.extras"
        title-level="h3"
      />
      <ExtraAccordion
        v-if="dataset.harvest"
        :button-text="$t('Voir les extras du moissonnage')"
        :title-text="$t('Moissonnage')"
        :extra="dataset.harvest"
        title-level="h3"
      >
        <template #buttons>
          <BrandedButton
            v-if="isMeAdmin() && dataset.harvest.source_id"
            size="xs"
            color="secondary"
            :icon="RiServerLine"
            :href="`/admin/harvesters/${dataset.harvest.source_id}`"
          >
            {{ $t('Voir la source du moissonnage') }}
          </BrandedButton>
        </template>
      </ExtraAccordion>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, DatasetInformationSection, DatasetTemporalitySection, DatasetSpatialSection, DatasetSchemaSection, DatasetEmbedSection, ExtraAccordion, LeafletMap, type DatasetV2WithFullObject } from '@datagouv/components-next'
import { RiServerLine } from '@remixicon/vue'

defineProps<{ dataset: DatasetV2WithFullObject }>()

useSeoMeta({ robots: 'noindex' })
</script>
