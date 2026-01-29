<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Loaders
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour afficher les états de chargement.
      </p>
    </div>

    <DesignDocSection
      title="LoadingBlock"
      description="Wrapper qui affiche un loader pendant le chargement des données et le contenu une fois chargé."
      :in-lib="true"
    >
      <template #props>
        <PropsTable :props="loadingBlockProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <p class="mb-2 text-sm text-gray-500">
                Status: pending
              </p>
              <LoadingBlock
                :status="'pending'"
                :data="null"
              >
                <template #default="{ data }">
                  <div>{{ data }}</div>
                </template>
              </LoadingBlock>
            </div>
            <div>
              <p class="mb-2 text-sm text-gray-500">
                Status: success
              </p>
              <LoadingBlock
                :status="'success'"
                :data="sampleData"
              >
                <template #default="{ data }">
                  <div class="rounded-lg bg-white p-4 shadow">
                    <p class="font-medium">
                      {{ data.title }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ data.description }}
                    </p>
                  </div>
                </template>
              </LoadingBlock>
            </div>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="loadingBlockCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="AnimatedLoader"
      description="Indicateur de chargement animé."
      :in-lib="true"
    >
      <template #preview>
        <ComponentPreview>
          <div class="flex items-center gap-8">
            <div class="text-center">
              <AnimatedLoader class="size-8" />
              <p class="mt-2 text-sm text-gray-500">
                Taille par défaut
              </p>
            </div>
            <div class="text-center">
              <AnimatedLoader class="size-12" />
              <p class="mt-2 text-sm text-gray-500">
                Grande taille
              </p>
            </div>
            <div class="text-center">
              <AnimatedLoader class="size-4" />
              <p class="mt-2 text-sm text-gray-500">
                Petite taille
              </p>
            </div>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="animatedLoaderCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { AnimatedLoader, LoadingBlock } from '@datagouv/components-next'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const sampleData = {
  title: 'Données chargées',
  description: 'Le contenu s\'affiche une fois les données disponibles.',
}

const loadingBlockProps: PropDefinition[] = [
  { name: 'status', type: 'string', required: true, description: 'État du chargement', options: ['pending', 'success', 'error', 'idle'] },
  { name: 'data', type: 'T | null', required: true, description: 'Données à passer au slot' },
]

const loadingBlockCode = `
<template>
  <LoadingBlock
    :status="status"
    :data="dataset"
  >
    <template #default="{ data }">
      <DatasetCard :dataset="data" />
    </template>
  </LoadingBlock>
</template>

<script setup>
import { LoadingBlock } from '@datagouv/components-next'

const { data: dataset, status } = await useAPI('/api/2/datasets/xxx/')
<\/script>
`

const animatedLoaderCode = `
<template>
  <AnimatedLoader class="size-8" />
</template>

<script setup>
import { AnimatedLoader } from '@datagouv/components-next'
<\/script>
`
</script>
