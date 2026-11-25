<template>
  <div class="divide-y">
    <DatasetInformationSection :dataset="dataset">
      <!-- A dataset that cannot get a DOI offers no request at all rather than sending the support a demand refused in advance. -->
      <div v-if="doi || !doiBlockedReason(dataset)">
        <DescriptionListTerm>{{ $t('DOI') }}</DescriptionListTerm>
        <DescriptionListDetails
          v-if="doi"
          class="flex items-center gap-2"
        >
          <a
            :href="`https://doi.org/${doi}`"
            target="_blank"
            rel="noopener noreferrer"
            class="link"
          >
            {{ doi }}
          </a>
          <CopyButton
            class="!-mt-0.5"
            :label="$t('Copier le DOI')"
            :copied-label="$t('DOI copié !')"
            :text="doi"
            :hide-label="true"
          />
        </DescriptionListDetails>
        <DescriptionListDetails
          v-else
          class="flex flex-wrap items-center gap-x-3 gap-y-1"
        >
          <span>{{ $t("Ce jeu de données n'a pas de DOI.") }}</span>
          <DoiRequestModal :dataset="dataset" />
        </DescriptionListDetails>
      </div>
    </DatasetInformationSection>
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
import { BrandedButton, CopyButton, DatasetInformationSection, DatasetTemporalitySection, DatasetSpatialSection, DatasetSchemaSection, DatasetEmbedSection, DescriptionListDetails, DescriptionListTerm, ExtraAccordion, LeafletMap, type DatasetV2WithFullObject } from '@datagouv/components-next'
import { RiServerLine } from '@remixicon/vue'
import DoiRequestModal from '~/components/Datasets/DoiRequestModal.vue'

const props = defineProps<{ dataset: DatasetV2WithFullObject }>()

const doi = computed(() => getDatasetDoi(props.dataset))
const doiBlockedReason = useDoiBlockedReason()

useSeoMeta({ robots: 'noindex' })
</script>
