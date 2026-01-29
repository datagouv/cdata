<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Pagination
      </h1>
      <p class="mt-2 text-gray-600">
        Composant pour naviguer dans des listes paginées.
      </p>
    </div>

    <DesignDocSection
      title="Pagination"
      description="Composant de pagination avec navigation par pages."
      :in-lib="true"
    >
      <template #props>
        <PropsTable :props="paginationProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <div class="space-y-4">
            <p class="text-sm text-gray-500">
              Page actuelle: {{ currentPage }}
            </p>
            <Pagination
              :page="currentPage"
              :page-size="10"
              :total-results="150"
              @change="(p: number) => currentPage = p"
            />
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="paginationCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { Pagination } from '@datagouv/components-next'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const currentPage = ref(1)

const paginationProps: PropDefinition[] = [
  { name: 'page', type: 'number', required: true, description: 'Numéro de page actuel' },
  { name: 'pageSize', type: 'number', required: true, description: 'Nombre d\'éléments par page' },
  { name: 'totalResults', type: 'number', required: true, description: 'Nombre total d\'éléments' },
]

const paginationCode = `
<template>
  <Pagination
    :page="currentPage"
    :page-size="20"
    :total-results="totalCount"
    @change="handlePageChange"
  />
</template>

<script setup>
import { Pagination } from '@datagouv/components-next'

const currentPage = ref(1)
const totalCount = 150

const handlePageChange = (page) => {
  currentPage.value = page
}
<\/script>
`
</script>
