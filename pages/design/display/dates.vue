<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Dates
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour l'affichage des dates et périodes.
      </p>
    </div>

    <DesignDocSection
      title="DateRangeDetails"
      description="Affiche une période de dates avec différents formats selon la granularité."
      :in-lib="true"
    >
      <template #props>
        <PropsTable :props="dateRangeProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <div class="space-y-2">
            <DateRangeDetails :range="{ start: '2024-01-01', end: null }" />
            <DateRangeDetails :range="{ start: '2024-01-01', end: '2024-12-31' }" />
            <DateRangeDetails :range="{ start: '2024-01-01', end: '2025-12-31' }" />
            <DateRangeDetails :range="{ start: '2024-01-01', end: '2026-12-31' }" />
            <DateRangeDetails :range="{ start: '2024-02-01', end: null }" />
            <DateRangeDetails :range="{ start: '2024-01-01', end: '2024-01-31' }" />
            <DateRangeDetails :range="{ start: '2024-01-01', end: '2024-02-29' }" />
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="dateRangeCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="useFormatDate"
      description="Composable pour formater les dates selon différents formats."
      :in-lib="true"
    >
      <template #preview>
        <ComponentPreview>
          <div class="space-y-2">
            <p>
              <span class="text-gray-500">Date formatée:</span>
              {{ formatDate(now) }}
            </p>
            <p>
              <span class="text-gray-500">Relative:</span>
              {{ formatFromNow(oneWeekAgo) }}
            </p>
            <p>
              <span class="text-gray-500">Relative si récent:</span>
              {{ formatRelativeIfRecentDate(now) }}
            </p>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="useFormatDateCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { DateRangeDetails, useFormatDate } from '@datagouv/components-next'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const { formatDate, formatFromNow, formatRelativeIfRecentDate } = useFormatDate()
const now = new Date().toISOString()
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

const dateRangeProps: PropDefinition[] = [
  { name: 'range', type: '{ start: string, end: string | null }', required: true, description: 'Objet contenant les dates de début et fin' },
]

const dateRangeCode = `
<template>
  <DateRangeDetails :range="{ start: '2024-01-01', end: '2024-12-31' }" />
</template>

<script setup>
import { DateRangeDetails } from '@datagouv/components-next'
<\/script>
`

const useFormatDateCode = `
<script setup>
import { useFormatDate } from '@datagouv/components-next'

const { formatDate, formatFromNow, formatRelativeIfRecentDate } = useFormatDate()

const date = '2024-01-15T10:30:00Z'
console.log(formatDate(date))                 // "15 janv. 2024"
console.log(formatFromNow(date))              // "il y a 2 semaines"
console.log(formatRelativeIfRecentDate(date)) // Relatif si récent, sinon date
<\/script>
`
</script>
