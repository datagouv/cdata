<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Métriques
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour afficher des statistiques et indicateurs.
      </p>
    </div>

    <DesignDocSection
      title="StatBox"
      description="Boîte pour afficher une statistique avec titre, données et graphique."
      :in-lib="true"
    >
      <template #props>
        <PropsTable :props="statBoxProps" />
      </template>

      <template #code>
        <CodeExample :code="statBoxCode" />
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
/* eslint-disable no-useless-escape, @typescript-eslint/no-unused-vars */
import { DatasetQuality, LoadingBlock, StatBox } from '@datagouv/components-next'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const { dataset, datasetStatus } = useDesignData()

const statBoxProps: PropDefinition[] = [
  { name: 'title', type: 'string', required: true, description: 'Titre de la statistique' },
  { name: 'type', type: 'string', required: true, description: 'Type de graphique', options: ['line', 'bar'] },
  { name: 'data', type: 'Record<string, number>', description: 'Données pour le graphique' },
  { name: 'summary', type: 'number', description: 'Valeur résumée à afficher' },
]

const statBoxCode = `
<template>
  <StatBox
    title="Téléchargements"
    type="line"
    :data="{ '2024-01': 100, '2024-02': 150, '2024-03': 200 }"
    :summary="450"
  />
</template>

<script setup>
import { StatBox } from '@datagouv/components-next'
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
