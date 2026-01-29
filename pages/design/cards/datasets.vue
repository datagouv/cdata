<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Dataset Cards
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour afficher les jeux de données.
      </p>
    </div>

    <DesignDocSection
      title="DatasetCard"
      description="Carte principale pour afficher un jeu de données avec ses métadonnées."
      :in-lib="true"
    >
      <template #props>
        <PropsTable :props="datasetCardProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <LoadingBlock
            :status="datasetStatus"
            :data="dataset"
          >
            <template #default="{ data }">
              <div class="max-w-xl">
                <DatasetCard
                  :dataset="data"
                  dataset-url="#"
                />
              </div>
            </template>
          </LoadingBlock>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="datasetCardCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="EmbedsDatasetCard"
      description="Version embeddable de la carte dataset, charge les données à partir du slug."
      :in-lib="false"
    >
      <template #props>
        <PropsTable :props="embedsDatasetCardProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <div class="grid gap-4 md:grid-cols-2">
            <EmbedsDatasetCard :slug="settings.datasetSlug" />
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="embedsDatasetCardCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="DatasetQuality"
      description="Affiche le score de qualité d'un dataset."
      :in-lib="true"
    >
      <template #preview>
        <ComponentPreview>
          <LoadingBlock
            :status="datasetStatus"
            :data="dataset"
          >
            <template #default="{ data }">
              <DatasetQuality :quality="data.quality" />
            </template>
          </LoadingBlock>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="datasetQualityCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { DatasetCard, DatasetQuality, LoadingBlock } from '@datagouv/components-next'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const { settings } = useDesignSettings()
const { dataset, datasetStatus } = useDesignData()

const datasetCardProps: PropDefinition[] = [
  { name: 'dataset', type: 'Dataset', required: true, description: 'Objet dataset à afficher' },
  { name: 'datasetUrl', type: 'string', required: true, description: 'URL vers la page du dataset' },
]

const embedsDatasetCardProps: PropDefinition[] = [
  { name: 'slug', type: 'string', required: true, description: 'Slug du dataset à charger' },
]

const datasetCardCode = `
<template>
  <DatasetCard
    :dataset="dataset"
    :dataset-url="\`/datasets/\${dataset.slug}\`"
  />
</template>

<script setup>
import { DatasetCard } from '@datagouv/components-next'

const { data: dataset } = await useAPI('/api/2/datasets/xxx/')
<\/script>
`

const embedsDatasetCardCode = `
<template>
  <EmbedsDatasetCard slug="mon-dataset" />
</template>

<script setup>
import EmbedsDatasetCard from '~/components/Embeds/DatasetCard.global.vue'
<\/script>
`

const datasetQualityCode = `
<template>
  <DatasetQuality :quality="dataset.quality" />
</template>

<script setup>
import { DatasetQuality } from '@datagouv/components-next'
<\/script>
`
</script>
