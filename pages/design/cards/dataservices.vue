<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Dataservice Cards
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour afficher les APIs et services de données.
      </p>
    </div>

    <DesignDocSection
      title="DataserviceCard"
      description="Carte pour afficher un dataservice/API avec ses informations."
      :in-lib="true"
    >
      <template #props>
        <PropsTable :props="dataserviceCardProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <LoadingBlock
            :status="dataserviceStatus"
            :data="dataservice"
          >
            <template #default="{ data }">
              <div class="max-w-xl">
                <DataserviceCard :dataservice="data" />
              </div>
            </template>
          </LoadingBlock>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="dataserviceCardCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="EmbedsDataserviceCard"
      description="Version embeddable de la carte dataservice, charge les données à partir du slug."
      :in-lib="false"
    >
      <template #props>
        <PropsTable :props="embedsDataserviceCardProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <div class="grid gap-4 md:grid-cols-2">
            <EmbedsDataserviceCard :slug="settings.dataserviceSlug" />
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="embedsDataserviceCardCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { DataserviceCard, LoadingBlock } from '@datagouv/components-next'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const { settings } = useDesignSettings()
const { dataservice, dataserviceStatus } = useDesignData()

const dataserviceCardProps: PropDefinition[] = [
  { name: 'dataservice', type: 'Dataservice', required: true, description: 'Objet dataservice à afficher' },
]

const embedsDataserviceCardProps: PropDefinition[] = [
  { name: 'slug', type: 'string', required: true, description: 'Slug du dataservice à charger' },
]

const dataserviceCardCode = `
<template>
  <DataserviceCard :dataservice="dataservice" />
</template>

<script setup>
import { DataserviceCard } from '@datagouv/components-next'

const { data: dataservice } = await useAPI('/api/1/dataservices/xxx/')
<\/script>
`

const embedsDataserviceCardCode = `
<template>
  <EmbedsDataserviceCard slug="mon-api" />
</template>

<script setup>
import EmbedsDataserviceCard from '~/components/Embeds/DataserviceCard.global.vue'
<\/script>
`
</script>
